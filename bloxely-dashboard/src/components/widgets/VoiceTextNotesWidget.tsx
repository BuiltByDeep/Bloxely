import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { BaseWidgetProps } from '../../types/widget';

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface Note {
  id: string;
  type: 'text' | 'voice';
  content: string;
  audioUrl?: string;
  transcript?: string;
  timestamp: Date;
  important: boolean;
}

interface VoiceTextNotesWidgetProps extends BaseWidgetProps {}

const VoiceTextNotesWidget: React.FC<VoiceTextNotesWidgetProps> = ({ widget, onUpdate }) => {
  const [notes, setNotes] = useState<Note[]>(widget.content.notes || []);
  const [newNote, setNewNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
        };
      }
    }
  }, []);

  // Save notes to widget data
  useEffect(() => {
    onUpdate({ notes });
  }, [notes, onUpdate]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          stream.getTracks().forEach(track => track.stop());
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');

      // Start transcription
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop transcription
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const saveVoiceNote = useCallback(() => {
    if (audioUrl) {
      const newVoiceNote: Note = {
        id: Date.now().toString(),
        type: 'voice',
        content: `Voice note (${formatTime(recordingTime)})`,
        audioUrl,
        transcript: transcript.trim() || undefined,
        timestamp: new Date(),
        important: false
      };

      setNotes(prev => [newVoiceNote, ...prev]);
      setAudioUrl(null);
      setTranscript('');
      setRecordingTime(0);
    }
  }, [audioUrl, transcript, recordingTime]);

  const saveTextNote = useCallback(() => {
    if (newNote.trim()) {
      const newTextNote: Note = {
        id: Date.now().toString(),
        type: 'text',
        content: newNote.trim(),
        timestamp: new Date(),
        important: false
      };

      setNotes(prev => [newTextNote, ...prev]);
      setNewNote('');
    }
  }, [newNote]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditText('');
    }
  }, [editingId]);

  const toggleImportant = useCallback((id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, important: !note.important } : note
    ));
  }, []);

  const startEditing = useCallback((note: Note) => {
    setEditingId(note.id);
    setEditText(note.type === 'text' ? note.content : note.transcript || '');
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editText.trim()) {
      setNotes(prev => prev.map(note =>
        note.id === editingId
          ? {
              ...note,
              content: editText.trim(),
              transcript: note.type === 'voice' ? editText.trim() : note.transcript
            }
          : note
      ));
      setEditingId(null);
      setEditText('');
    }
  }, [editingId, editText]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
      {/* Input Section */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveTextNote()}
              placeholder="Type a note..."
              className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-300/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500/70 dark:placeholder-slate-400/70 backdrop-blur-sm transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <button
            onClick={saveTextNote}
            disabled={!newNote.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white rounded-xl transition-all duration-200 text-sm font-semibold disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
          >
            Add
          </button>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-5 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/25'
                : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 text-slate-700 dark:text-slate-300 shadow-slate-200/50'
            }`}
          >
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                <span className="font-mono text-xs">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Voice Note Preview */}
        {audioUrl && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 space-y-3 backdrop-blur-sm shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <audio src={audioUrl} controls className="w-full h-8 rounded-lg" />
              </div>
              <button
                onClick={saveVoiceNote}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Save
              </button>
            </div>
            {transcript && (
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Transcript:</span>
                </div>
                <p className="ml-6 italic">{transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="text-base text-center font-medium">No notes yet.</p>
            <p className="text-sm text-center opacity-75">Start typing or recording!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                note.important
                  ? 'border-red-200/50 dark:border-red-800/50 bg-gradient-to-r from-red-50/30 to-pink-50/30 dark:from-red-900/20 dark:to-pink-900/20 shadow-red-500/10'
                  : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Note Type Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  note.type === 'voice'
                    ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400'
                    : 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {note.type === 'voice' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-300/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm text-slate-900 dark:text-slate-100 resize-none backdrop-blur-sm transition-all duration-200"
                        rows={3}
                        placeholder="Edit your note..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 hover:from-slate-400 hover:to-slate-500 dark:hover:from-slate-500 dark:hover:to-slate-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {formatDate(note.timestamp)}
                      </div>
                      {note.type === 'voice' ? (
                        <div className="space-y-3">
                          {note.audioUrl && (
                            <audio src={note.audioUrl} controls className="w-full h-8 rounded-lg" />
                          )}
                          {note.transcript && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">Transcript</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {note.transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => toggleImportant(note.id)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      note.important
                        ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={note.important ? 'Remove from important' : 'Mark as important'}
                  >
                    <svg className="w-4 h-4" fill={note.important ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>

                  {note.type === 'text' && editingId !== note.id && (
                    <button
                      onClick={() => startEditing(note)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Edit note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceTextNotesWidget;