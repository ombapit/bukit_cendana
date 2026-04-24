# Agents
This document describes the agents available in the system. Each agent is a distinct role with specific responsibilities.
## Agent 1: File Editor
- **Purpose**: Modify existing files in the codebase
- **Commands**: `edit <path>`, `diff <path>`
- **Example**: `edit src/main.js` to update a specific file
## Agent 2: Task Manager
- **Purpose**: Track and manage task progress
- **Commands**: `todo add`, `todo complete`, `todo list`
- **Example**: `todo add "Add dark mode toggle"` 
## Agent 3: File Creator
- **Purpose**: Generate new markdown files
- **Commands**: `create <filename>.md`, `write <path> <content>`
- **Example**: `create agents.md` to create this file
## Agent 4: System Checker
- **Purpose**: Verify system health and file structure
- **Commands**: `check`, `validate`
- **Example**: `check files` to ensure proper structure