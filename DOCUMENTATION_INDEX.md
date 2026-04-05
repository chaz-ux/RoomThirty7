# Documentation Index

Complete guide to all documentation files in the ROOM 37 codebase.

---

## 📚 Documentation Files

### 1. **README.md** — Project Overview
**Purpose**: Main entry point for understanding the project  
**Audience**: Everyone (users, developers, contributors)  
**Contains**:
- Project mission & features
- Game descriptions & player counts
- Tech stack overview
- Installation & deployment instructions
- How to play (local vs online)
- Recent updates & features

**When to Read**: First time visiting the project

---

### 2. **DEVELOPMENT_GUIDE.md** — Developer Reference
**Purpose**: Complete technical guide for developers  
**Audience**: Developers building/modifying games  
**Contains**:
- Architecture overview
- Folder structure explanation
- Mafia game deep dive (phases, state, functions)
- Charades game enhancements (teams, actors)
- State management patterns
- Game loop & timer system
- UI component patterns
- How to add new games
- Deployment & testing checklist
- Common patterns & troubleshooting

**When to Read**: Before implementing features or modifying games

---

### 3. **VOTING_SYSTEM_FIX.md** — Voting Mechanics Deep Dive
**Purpose**: Detailed documentation of voting system redesign  
**Audience**: Developers understanding/debugging voting  
**Contains**:
- Problems solved (skip bug, hidden ballots, no tie resolution)
- Implementation details (VOTE_REVOTE phase, reVoteCount tracking)
- New state properties
- Vote resolution logic
- Phase flow diagram
- Files modified & line numbers
- Build status & testing checklist

**When to Read**: Implementing voting-related features or debugging vote issues

---

### 4. **GAME_FLOW_REDESIGN.md** — Game Design Document
**Purpose**: Complete redesign rationale & implementation  
**Audience**: Game designers, developers, stakeholders  
**Contains**:
- What was delivered
- Problems solved (voting, game flow, role assignments)
- Changes made to each phase
- Night phase mechanics (local vs online)
- Role reveal & discussion improvements
- Elimination mechanics
- Key design principles applied
- Files modified summary
- Build validation

**When to Read**: Understanding the overall game design philosophy

---

### 5. **PROJECT_COMPLETION_REPORT.md** — Implementation Details
**Purpose**: Comprehensive completion report with details  
**Audience**: Project stakeholders, developers  
**Contains**:
- Executive summary
- Problems solved (all 6 major issues)
- Features delivered
- Testing results
- Performance metrics
- Build output details
- Deployment status
- What works well
- Edge case handling
- Code quality notes

**When to Read**: Evaluating project completion & reviewing what was delivered

---

### 6. **IMPLEMENTATION_SUMMARY.md** — Implementation Log
**Purpose**: Summary of voting system & game flow redesign  
**Audience**: Technical review & documentation  
**Contains**:
- Executive summary
- Voting system overhaul details
- Game flow redesign changes
- All changes made to each phase
- File modifications
- Build status

**When to Read**: Quick reference on what was implemented

---

### 7. **DOCUMENTATION_INDEX.md** — This File
**Purpose**: Navigate all documentation  
**Audience**: Everyone  
**Contains**:
- Guide to what each doc contains
- When to read each document
- Cross-references between docs

**When to Read**: When unsure which document to consult

---

## 🎮 Game-Specific Resources

### Mafia Game
- **Main File**: `src/games/mafia/MafiaGame.tsx` (1,631 lines)
- **Styling**: `src/games/mafia/Mafia.css`
- **Documentation**: 
  - See [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Mafia Game Deep Dive section
  - See [VOTING_SYSTEM_FIX.md](#3-voting_system_fixmd--voting-mechanics-deep-dive)
  - See [GAME_FLOW_REDESIGN.md](#4-game_flow_redesignmd--game-design-document)

### Charades Game
- **Main File**: `src/games/charades/CharadesGame.tsx` (931 lines)
- **Styling**: `src/games/charades/Charades.css`
- **Documentation**: 
  - See [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Charades Game Updates section
  - **Features**: Team assignment, sequential actor rotation, team visibility

### Other Games
- **30 Seconds**: `src/games/30seconds/`
- **Hangman**: `src/games/hangman/`
- **Imposter**: `src/games/imposter/`
- **Movie**: `src/games/movie/`

---

## 🔍 Quick Reference

### "I want to understand the project"
1. Read [README.md](#1-readmemd--project-overview)
2. Skim [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Architecture Overview
3. Skim [PROJECT_COMPLETION_REPORT.md](#5-project_completion_reportmd--implementation-details)

### "I'm debugging the voting system"
1. Read [VOTING_SYSTEM_FIX.md](#3-voting_system_fixmd--voting-mechanics-deep-dive)
2. Reference [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Vote Resolution section
3. Check `src/games/mafia/MafiaGame.tsx` lines 398-437 (resolveVotesFromState function)

### "I'm implementing a new feature"
1. Read [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) completely
2. Reference specific section (Game Loops, UI Patterns, Adding New Games, etc.)
3. Check [GAME_FLOW_REDESIGN.md](#4-game_flow_redesignmd--game-design-document) for design philosophy

### "I'm adding a new game"
1. Read [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Adding New Games section
2. Use `src/games/charades/CharadesGame.tsx` as template
3. Register in `Lobby.tsx` and `Home.tsx`

### "I want to understand the Mafia game"
1. Read [GAME_FLOW_REDESIGN.md](#4-game_flow_redesignmd--game-design-document)
2. Read [VOTING_SYSTEM_FIX.md](#3-voting_system_fixmd--voting-mechanics-deep-dive)
3. Reference [DEVELOPMENT_GUIDE.md](#2-development_guidemd--developer-reference) — Mafia Game Deep Dive

---

## 📊 Documentation Statistics

| Document | Lines | Focus | Status |
|-----------|-------|-------|--------|
| README.md | 250+ | Overview & Getting Started | ✅ Current |
| DEVELOPMENT_GUIDE.md | 550+ | Technical Deep Dive | ✅ Current |
| VOTING_SYSTEM_FIX.md | 100+ | Voting Mechanics | ✅ Current |
| GAME_FLOW_REDESIGN.md | 400+ | Game Design | ✅ Current |
| PROJECT_COMPLETION_REPORT.md | 550+ | Completion Report | ✅ Current |
| IMPLEMENTATION_SUMMARY.md | 420+ | Implementation Log | ✅ Current |

**Total**: 2,270+ lines of documentation

---

## 🔗 Cross-References

### State Management
- [DEVELOPMENT_GUIDE.md — State Management](#state-management)
- [VOTING_SYSTEM_FIX.md — New State Property](#new-state-property)

### Timer System
- [DEVELOPMENT_GUIDE.md — Game Loop & Timers](#game-loop--timers)
- [GAME_FLOW_REDESIGN.md — Timer Implementation](#timer-implementation)

### Voting Logic
- [VOTING_SYSTEM_FIX.md](#3-voting_system_fixmd--voting-mechanics-deep-dive)
- [DEVELOPMENT_GUIDE.md — Mafia Game Deep Dive — Vote Resolution](#key-functions)
- [GAME_FLOW_REDESIGN.md — Voting Phase](#voting-phase)

### Game Phases
- [DEVELOPMENT_GUIDE.md — Mafia Game Deep Dive — Game Phases](#game-phases)
- [GAME_FLOW_REDESIGN.md — Game Flow](#game-flow)

---

## 📝 Documentation Standards

All documentation uses:
- **Markdown format** for version control & GitHub rendering
- **Code blocks** for technical examples (TypeScript)
- **Tables** for structured information
- **Headers** for clear navigation
- **Links** for cross-referencing
- **Checkboxes** for testing checklists

---

## 🚀 Keeping Docs Updated

When making changes:
1. Update relevant .md file immediately
2. Update DOCUMENTATION_INDEX.md if adding new doc
3. Commit docs with feature code
4. Use git history to track changes

Example commit message:
```
feat: add new voting feature
docs: update VOTING_SYSTEM_FIX.md and DEVELOPMENT_GUIDE.md
```

---

## 📞 Support

For questions about documentation:
- Check this index file first
- Review the specific document
- Search for keywords in relevant docs
- Check git commit history for context

---

**Last Updated**: April 5, 2026  
**Status**: Complete ✅  
**Coverage**: All major systems documented
