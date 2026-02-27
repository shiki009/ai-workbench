# SAW Agent Pipelines

## Quick Reference

| Pipeline | Command | When to Use | Stages |
|----------|---------|-------------|--------|
| **Feature** | `@saw-orchestrator` | New feature (tool, UI, worker) | planner → architect → implementor → tester → reviewer |
| **Bugfix** | `@saw-bug-orchestrator` | Bug report, unknown root cause | triager → fixer → tester → reviewer |
| **Hotfix** | `@saw-hotfix-orchestrator` | Bug with known root cause, needs fast fix | fixer → reviewer |
| **Refactor** | `@saw-refactor-orchestrator` | Restructure code, preserve behavior | analyzer → executor → tester → reviewer |

## How Pipelines Work

### 1. You describe the work

Tell the orchestrator what you need in natural language:

```
@saw-orchestrator Add audio transcription tool — users can upload audio and get text transcription
@saw-bug-orchestrator The image classifier crashes when processing large files
@saw-hotfix-orchestrator The worker-image-classify.js is missing error handling in the run handler
@saw-refactor-orchestrator Extract model loading logic from AIManager into a separate ModelLoader class
```

### 2. The orchestrator creates a work directory

Each pipeline type has its own directory:

```
.planning/
├── features/{slug}/      ← feature pipeline
├── bugs/{slug}/          ← bugfix pipeline
├── hotfixes/{slug}/      ← hotfix pipeline
└── refactors/{slug}/     ← refactor pipeline
```

### 3. Agents run in sequence

The orchestrator spawns one agent at a time. Each agent:
- Reads its instructions from `.claude/agents/saw-{name}.md`
- Reads predecessor artifacts from the work directory
- Does its work (investigation, code changes, testing, review)
- Writes its output artifact to the work directory
- Reports status: `complete`, `blocked`, or `failed`

### 4. Artifacts pass between agents

Agents communicate through markdown files with YAML frontmatter:

```yaml
---
feature: audio-transcription
stage: planner
status: complete
produced_by: saw-planner
consumed_by: saw-architect
---
```

The orchestrator tracks everything in `PIPELINE-STATE.md`:

```
| # | Stage | Agent | Status | Started | Completed | Artifact |
|---|-------|-------|--------|---------|-----------|----------|
| 1 | Plan | saw-planner | complete | 12:00 | 12:02 | 01-SPEC.md |
| 2 | Architect | saw-architect | running | 12:02 | | 02-ARCHITECTURE.md |
| 3 | Implement | saw-implementor | pending | | | 03-IMPLEMENTATION.md |
```

### 5. The reviewer decides the outcome

Every pipeline ends with the reviewer. Three possible verdicts:
- **pass** — ship it
- **pass-with-warnings** — ship it, but address the warnings
- **fail** — the orchestrator determines which stage to re-run

## Running Individual Agents

You can run any agent standalone without a pipeline:

```
# Investigation only
@saw-bug-triager Investigate why the text generator produces empty results

# Code review only
@saw-reviewer Review src/tools/ImageGeneratorTool.js against conventions

# Quick analysis
@saw-refactor-analyzer Map all dependencies of src/ai/AIManager.js
```

When running standalone, tell the agent where to write its output.

## Choosing the Right Pipeline

```
"I need a new feature"                    → @saw-orchestrator (feature)
"Something is broken, not sure why"       → @saw-bug-orchestrator (bugfix)
"Something is broken, I know the cause"   → @saw-hotfix-orchestrator (hotfix)
"I want to restructure this code"         → @saw-refactor-orchestrator (refactor)
"Single-file fix, trivial change"         → just do it directly, no pipeline needed
```

## Coverage

Every development workflow is covered by either a pipeline or a direct action:

| Workflow | Covered? | How |
|----------|----------|-----|
| Build a new feature | yes | Feature pipeline |
| Fix a bug (unknown cause) | yes | Bugfix pipeline |
| Fix a bug (known cause, fast) | yes | Hotfix pipeline |
| Restructure / migrate code | yes | Refactor pipeline |
| Code review | yes | `@saw-reviewer` standalone |
| Investigation only | yes | `@saw-bug-triager` standalone |
| Dependency analysis | yes | `@saw-refactor-analyzer` standalone |
| Single-file edit | yes | Direct edit, no pipeline needed |
| Config / env changes | yes | Direct edit, no pipeline needed |

## Agent Inventory

### Feature Pipeline (5 agents)
| Agent | Role | Writes Code? |
|-------|------|-------------|
| `saw-orchestrator` | Coordinates feature pipeline | No |
| `saw-planner` | Writes feature spec | No |
| `saw-architect` | Designs technical approach | No |
| `saw-implementor` | Implements all code (tools, workers, UI, styles) | Yes |
| `saw-tester` | Verifies build and patterns | Yes |
| `saw-reviewer` | Reviews all changes | No (read-only) |

### Bugfix Pipeline (3 new + reuses tester, reviewer)
| Agent | Role | Writes Code? |
|-------|------|-------------|
| `saw-bug-orchestrator` | Coordinates bugfix pipeline | No |
| `saw-bug-triager` | Investigates root cause | No (read-only) |
| `saw-bug-fixer` | Implements minimal fix | Yes |

### Refactor Pipeline (3 new + reuses tester, reviewer)
| Agent | Role | Writes Code? |
|-------|------|-------------|
| `saw-refactor-orchestrator` | Coordinates refactor pipeline | No |
| `saw-refactor-analyzer` | Maps dependencies, plans steps | No (read-only) |
| `saw-refactor-executor` | Executes refactor changes | Yes |

### Hotfix Pipeline (1 new + reuses bug-fixer, reviewer)
| Agent | Role | Writes Code? |
|-------|------|-------------|
| `saw-hotfix-orchestrator` | Fast-track fix, skip triage | No |

**Total: 13 agent files, 4 pipelines**

## Shared Agents

Some agents are reused across pipelines:

| Agent | Used By |
|-------|---------|
| `saw-tester` | feature, bugfix, refactor |
| `saw-reviewer` | feature, bugfix, hotfix, refactor |
| `saw-bug-fixer` | bugfix, hotfix |
