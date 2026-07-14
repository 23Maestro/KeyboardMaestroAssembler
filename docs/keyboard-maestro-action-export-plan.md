# Keyboard Maestro Action Export Plan

## Destination

Build a lean, import-safe Keyboard Maestro template library for natural-language macro assembly.

## Known Facts

- Keyboard Maestro actions are macro steps.
- Existing assembler rules are slot-only: replace only explicit `{{SLOT_NAME}}` placeholders.
- Current assembler-ready exports cover mouse clicks and text snippets.
- Raw exports must be slotized before the general assembler can use them.

## Folder Shape

```text
templates/action-groups/{number}_{group-label}/raw
templates/action-groups/{number}_{group-label}/slotized
```

File shape:

```text
{number}_{group-label}_{action-name}.kmmacros
```

## Tickets

1. Repo setup and public GitHub
2. Template folder cleanup and registry
3. Interface actions
4. Text, variables, and snippets
5. Clipboard actions
6. Control-flow actions
7. File actions
8. Browser and web-form actions
9. Script and shortcut actions
10. Image and OCR actions
11. Prompt, alert, and notification actions
12. Keyboard Maestro control, application, window, and system actions

## Export Checklist

### 01 Interface

- Move or Click Mouse
- Type a Keystroke
- Press a Button
- Select or Show a Menu Item
- Found Image click variants

### 02 Text, Variables, Snippets

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

### 07 Control Flow

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

### 11 Application and Window

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

## Do Not

- Do not invent XML or plist keys.
- Do not add action-group labels beyond the four Wayfinder labels in GitHub/Linear.
- Do not mark a group done until raw export, slotized export, manifest entry, and assembler validation are complete.
