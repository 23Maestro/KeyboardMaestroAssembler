# Keyboard Maestro Export Plan

## Goal

Make a clean library of real Keyboard Maestro actions.

The rule is simple:

- Export the real action from Keyboard Maestro.
- Save the raw export.
- Make a slot version only when it has clear `{{SLOT_NAME}}` fields.
- Never invent Keyboard Maestro XML.

## Folders

```text
templates/action-groups/{number}_{group-label}/raw
templates/action-groups/{number}_{group-label}/slotized
```

File names:

```text
{number}_{group-label}_{action-name}.kmmacros
```

## Task List

1. Keep folders and registry clean.
2. Export mouse and keyboard actions.
3. Export text and variable actions.
4. Export clipboard actions.
5. Export if, pause, and repeat actions.
6. Export file actions.
7. Export browser form actions.
8. Export script actions.
9. Export image and OCR actions.
10. Export prompt and alert actions.
11. Export app, window, and system actions.

## Export Checklist

### 01 Mouse and Keyboard

- Move or Click Mouse
- Type a Keystroke
- Press a Button
- Select or Show a Menu Item
- Found Image Click

### 02 Text and Variables

- Insert Text
- Insert Text by Typing
- Insert Text by Pasting
- Set Variable to Text
- Set Variable to Calculation
- Search and Replace
- Prompt for Snippet

### 05 Clipboard

- Set Clipboard to Text
- Copy
- Paste
- Copy to Named Clipboard
- Paste from Named Clipboard
- Clipboard History Switcher

### 07 If, Pause, Repeat

- If Then Else
- Switch/Case
- Pause
- Pause Until
- For Each
- Repeat
- While
- Until
- Group
- Try/Catch
- Assert

### 04 Files

- Read File
- Write File
- Append Text to File
- Move or Rename File
- Copy File
- Delete or Trash File
- Get File Attribute
- Prompt for File

### 03 Browser Forms

- Open URL
- New Browser Tab
- Wait for Browser to Finish Loading
- Set Browser Field to Text
- Set Browser Checkbox
- Set Browser Radio Button
- Submit Browser Form
- Execute JavaScript in Browser

### 06 Scripts

- Execute Shell Script
- Execute AppleScript
- Execute JavaScript for Automation
- Execute Swift Script
- Execute Shortcut
- Execute Macro
- Execute Subroutine

### 08 Images and OCR

- Screen Capture
- OCR Image
- OCR Screen
- Crop Image
- Resize Image
- Trim Image
- Draw Shape onto Image
- Get Image Size

### 09 Prompts and Alerts

- Prompt for User Input
- Prompt With List
- Custom HTML Prompt
- Alert
- Notification
- Display Text
- Display Progress
- Speak Text
- Play Sound

### 10 Keyboard Maestro Control

- Activate Macro Group
- Deactivate Macro Group
- Show Macro Group
- Hide Macro Group
- Trigger Macro by Name
- Cancel This Macro
- Cancel All Macros

### 11 Apps and Windows

- Activate Application
- Quit Application
- Hide Application
- Manipulate a Window
- Move and Resize Window
- Bring Window to Front

### 12 System

- Sleep Computer
- Restart Computer
- Set System Volume
- Mounted Volume actions
- Open Finder Selection

## Done Means

- Raw export is saved.
- Slot version is saved if needed.
- Registry is updated.
- Assembler still builds.
