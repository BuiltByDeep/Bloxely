## **Product Requirements Document: Bloxely**

* **Version:** 1.0 (Hackathon Edition)  
* **Date:** July 26, 2025  
* **Project Lead:** You

### **1\. Vision & Core Idea**

Bloxely is a minimalist, modular focus dashboard. It provides users with a blank canvas to build their ideal focus environment, free from digital clutter. Our vision is to empower users to reclaim their attention by providing simple, powerful tools that adapt to their workflow. The core philosophy is: **"Your Space, Your Focus."**

### **2\. The Problem**

Knowledge workers and students constantly juggle multiple applications and browser tabs (to-do lists, calendars, notes, timers). This context-switching is mentally expensive and fragments attention. Bloxely aims to solve this by creating a single, unified space for essential productivity tools, reducing clutter and the friction of switching between apps.

### **3\. Target Audience & Personas**

* **Persona 1: The Student (Priya)**  
  * **Needs:** To manage study sessions, track assignments, take quick notes, and stay focused during research.  
  * **Pain Points:** Gets distracted by social media; loses track of small assignments.  
  * **Desired Widgets:** Pomodoro Timer, To-Do List, Music Player, Website Blocker.  
* **Persona 2: The Freelancer (David)**  
  * **Needs:** To manage multiple client projects, track daily tasks, brainstorm ideas, and summarize client call notes.  
  * **Pain Points:** Difficulty visualizing project progress; notes are scattered across different apps.  
  * **Desired Widgets:** Kanban Board, Sticky Notes, AI Chatbot, Calendar View.  
* **Persona 3: The Professional (Amina)**  
  * **Needs:** A clear view of her daily schedule, a primary to-do list, and a quiet space to draft important emails and documents.  
  * **Pain Points:** Back-to-back meetings leave little time for deep work; corporate tools are noisy and distracting.  
  * **Desired Widgets:** Calendar View, To-Do List, Scratchpad, Clock.

**4\) Key Platform Features (The "Canvas"):**

* **Grid-based Layout:** Widgets snap to a grid for clean alignment.  
* **Drag, Drop, Resize:** Full control over the placement and size of each widget.  
* **Layout Templates:** Save and load different workspace layouts. For example:  
  * "Morning Deep Work" (Pomodoro, To-Do List, Music)  
  * "Project Planning" (Kanban Board, Sticky Notes, Scratchpad)  
  * "Meeting Prep" (Calendar, AI Chatbot for summary, Notes)  
* **Themes:** Light Mode, Dark Mode, and maybe a few calm color palettes (e.g., "Forest," "Ocean").  
* **Cross-device Sync:** The layout and data should sync seamlessly across a user's devices.

| Category | Widget Idea | Details & Potential Enhancements |
| :---- | :---- | :---- |
| **Time Management** | Pomodoro Timer | Customizable work/break intervals, session tracking, optional ticking sound, auto-start breaks. |
|  | Clock | Analog, digital, 12/24hr formats. Option to show date and day of the week. Timezone support. |
|  | Goal Tracker | Set a primary goal for the day/session. A simple text field that stays visible. Maybe a progress bar. |
|  | Habit Tracker | A visual way to check off daily habits (e.g., drink water, stretch, read). Uses a streak system. |
| **Task & Project Management** | To-Do List | Simple checkboxes. Ability to reorder, add due dates, create sub-tasks. |
|  | Sticky Notes | Color-coded notes for quick thoughts. Can be freely moved and resized. |
|  | Kanban Board | Simple columns (e.g., To Do, In Progress, Done). Drag-and-drop cards. Ideal for managing a small project. |
|  | Scratchpad/Editor | A more robust text editor than a sticky note. Supports Markdown for basic formatting. For drafting emails, writing paragraphs, etc. |
| **Information & Knowledge** | AI Chatbot | **Core:** Summarize pasted text/conversations. **Enhancements:** Act as a "rubber duck" for problem-solving, help break down large tasks into smaller steps, brainstorm ideas, rephrase sentences. |
|  | Calendar View | A minimal widget that integrates with Google/Outlook Calendar to show today's or this week's events. |
|  | Quick Links | A customizable list of frequently used URLs to avoid opening a new distracting tab. |
| **Ambiance & Focus Aids** | Music Player | Integration with Spotify/Apple Music or a built-in player for ambient sounds (rain, forest, cafe). Volume control. |
|  | Quote of the Day | A minimal, inspiring quote to set the tone. User can choose categories (e.g., Stoicism, Tech, Art). |
|  | Website Blocker | An integrated control to turn on/off a browser extension that blocks distracting sites during a focus session. |

---

**4.1. Features & Requirements (MVP \- Minimum Viable Product)**

The MVP will focus on delivering the core canvas and a foundational set of widgets.

| Priority | Feature | User Story | Acceptance Criteria |
| :---- | :---- | :---- | :---- |
| **P0 (Must-Have)** | **User Account & Data Sync** | As a user, I want to create an account so that my dashboard layout and data are saved and synced. | \- User can sign up/log in via email/password & Google OAuth. \- Dashboard state (widget positions, data) is persisted in a database. \- Changes on one device are reflected on another after a refresh. |
| **P0 (Must-Have)** | **Modular Canvas** | As a user, I want to add, move, and resize widgets on a blank screen to create my own layout. | \- An "Add Widget" menu is available. \- Widgets can be dragged and dropped onto a grid. \- Widgets can be resized. \- Widgets can be removed from the canvas. |
| **P0 (Must-Have)** | **To-Do List Widget** | As a user, I want a simple checklist to track my daily tasks. | \- Can add items. \- Can check/uncheck items. \- Checked items are visually distinct (e.g., strikethrough). \- Can delete items. |
| **P0 (Must-Have)** | **Sticky Notes Widget** | As a user, I want to jot down quick thoughts and reminders. | \- Can create multiple sticky notes. \- Can type text into a note. \- Can change the color of a note from a predefined palette. |
| **P1 (Should-Have)** | **Pomodoro Timer Widget** | As a user, I want to use the Pomodoro Technique to manage my focus sessions. | \- Default 25-min work / 5-min break cycle. \- Start, pause, and reset controls. \- A clear visual indicator of time remaining. \- An audible alarm when a session ends. |
| **P1 (Should-Have)** | **Clock & Date Widget** | As a user, I want to see the current time and date on my dashboard. | \- Displays current time in digital format. \- Displays the current date. \- User can choose between 12/24 hour format. |

### **4.2. Post-MVP Features (V1.1 and beyond)**

* **Kanban Task Board Widget:** For more complex project management.  
* **Music Player / Ambient Sounds Widget:** For setting a focused mood.  
* **AI Chatbot (Basic):** For summarizing text.  
* **Layout Templates:** Save/load different workspace configurations.  
* **Enhanced Themes:** More color palettes and customization options.

### **5\. Design & UX**

* **Aesthetic:** Clean, minimalist, modern. Ample white space. Calm color palette.  
* **Interaction:** Smooth and intuitive drag-and-drop. Low-friction interactions. Animations should be purposeful and not distracting.  
* **Responsiveness:** The dashboard should be fully functional on desktop and tablet screen sizes. A mobile view will be a simplified, read-only version initially.

Got it. A 15-day hackathon completely changes the strategy. Forget the multi-month plan; we need a lean, focused, and aggressive approach to build a winning prototype.

Here’s your 15-day battle plan.

### **The Goal: A "Wow" Prototype**

Your objective is not to build a full, scalable product. It's to build a **working prototype that impressively demonstrates the core idea**. We'll cut features ruthlessly and use shortcuts to get it done.

### **The Hackathon Scope (What to Actually Build)**

* **No User Accounts:** This is the biggest time-saver. We'll use the browser's `localStorage` to save the user's dashboard. It will work on their machine, which is perfect for a demo.  
* **Focus on Core Widgets:** We'll pick 3-4 widgets that are impactful but quick to build.  
* **Single, Polished Theme:** No theme switching. Pick one great-looking theme (Dark Mode is usually impressive) and stick with it.  
* **Desktop First:** Don't worry about mobile responsiveness. Design for a standard laptop screen.

---

### **Technology Stack for Speed 🚀**

* **Framework:** **React \+ Vite**. Vite provides a lightning-fast development environment.  
* **Styling:** **Tailwind CSS**. It lets you style directly in your HTML, which is incredibly fast for prototyping.  
* **Drag & Drop:** **`react-grid-layout`**. This library is a lifesaver. It handles the grid, dragging, and resizing for you. Don't try to build this from scratch.  
* **Deployment:** **Vercel** or **Netlify**. Connect your GitHub account, and it will deploy your site automatically on every push. It's free and takes minutes to set up.

---

### **The 15-Day Action Plan**

#### **Phase 1: The Foundation (Days 1 \- 4\)**

* **Day 1: Setup.**  
  * \[ \] Initialize your project: `npm create vite@latest my-focus-app -- --template react-ts`.  
  * \[ \] Install dependencies: `npm install tailwindcss react-grid-layout`.  
  * \[ \] Set up your GitHub repository.  
  * \[ \] **Deploy "Hello World" to Vercel/Netlify immediately.** This ensures your deployment pipeline is working from day one.  
* **Day 2: Build the Canvas.**  
  * \[ \] Create the main layout: a header with the app title and an "Add Widget" button.  
  * \[ \] Set up `react-grid-layout` to create the main empty grid where widgets will live.  
* **Days 3-4: The First Widgets (The Easy Wins).**  
  * \[ \] Create the **Clock** widget. It simply displays the current time.  
  * \[ \] Create the **Sticky Note** widget. It should be a simple text area with a colored background. Make the text editable.  
  * \[ \] Make these widgets appear on the grid when you click the "Add Widget" button.

#### **Phase 2: Core Functionality (Days 5 \- 9\)**

* **Days 5-6: The "Power" Widgets.**  
  * \[ \] Build the **To-Do List** widget. It needs an input field to add tasks and a list where you can check items off.  
  * \[ \] Build the **Pomodoro Timer** widget. This is the most complex so far. It needs start/pause/reset buttons and a visual display of the time remaining. Use `setInterval` within a `useEffect` hook.  
* **Days 7-8: Make It Persistent.**  
  * \[ \] **This is critical.** Implement `localStorage`.  
  * \[ \] Whenever the layout changes (widgets are added, moved, resized, or their content changes), save the entire layout and widget data to `localStorage`.  
  * \[ \] When the app loads, check if there's data in `localStorage`. If so, load it. This will make your app feel real.  
* **Day 9: Styling & Polish.**  
  * \[ \] Use Tailwind CSS to make everything look clean, modern, and cohesive.  
  * \[ \] Fix alignment issues. Ensure fonts and colors are consistent.  
  * \[ \] Add simple hover effects and transitions. A little polish goes a long way.

#### **Phase 3: The "Wow" Factor & Final Push (Days 10 \- 15\)**

* **Days 10-12: Stretch Goal \- The AI Chatbot.**  
  * \[ \] This will impress the judges. Create a new widget called "AI Assistant".  
  * \[ \] Use the free tier of the **OpenAI (ChatGPT) or Google Gemini API**.  
  * \[ \] Create a serverless function on Vercel/Netlify to handle the API call. **Do not put your API key in the frontend code.**  
  * \[ \] The widget should have an input box and a display area. When the user asks a question (e.g., "summarize this text..."), your serverless function calls the AI API and shows the result.  
* **Day 13: Buffer & Bug Squashing.**  
  * \[ \] Something will have gone wrong. Use this day to fix it.  
  * \[ \] If the AI chatbot was too hard, abandon it and spend this day making the other widgets look and feel amazing.  
  * \[ \] Ask a friend to test it and give you feedback.  
* **Day 14: Prepare for Submission.**  
  * \[ \] Write a clear `README.md` file for your GitHub project. Explain the concept, the tech stack, and how to run it.  
  * \[ \] **Record a short video demo.** This is your backup in case anything goes wrong during the live presentation.  
  * \[ \] Practice your 2-3 minute presentation pitch.  
* **Day 15: SUBMIT\!**  
  * \[ \] Do a final check of the submission requirements.  
  * \[ \] Submit your project and relax. You've earned it.

