# EquityFlow Project Context

## Overview
EquityFlow is a professional research workspace specialized for **Listed Property (REITs)** analysis. It helps investment analysts track a multi-step research pipeline, monitor earnings calendars, and centralize AI notes from NotebookLM.

## Current Research Focus
- **Sector**: Listed Property (REITs)
- **Primary Regions**: South Africa (Diversified), Central & Eastern Europe (Retail Focus), Spain (Specialist Retail).

## Core Features
1. **Research Pipeline**: A 5-step Kanban board (Step 1-5) ranging from Property Portfolio Checks to Final Investment Case generation.
2. **NotebookLM Integration**: Dedicated Hub view and per-task linking to Google NotebookLM repositories for AI-powered data synthesis.
3. **Earnings Alerts**: Real-time notification system triggering alerts for companies reporting today or within a 7-day window.
4. **Schedule View**: Visual calendar of upcoming earnings events for the tracked portfolio.
5. **Persistence**: Client-side memory implemented via `localStorage` for tasks and notification states.

## Project Guardrails
- **Design System**: "Premium Glass" aesthetic - high-contrast typography (Inter/Outfit), rose-accents for alerts, and subtle border shadows.
- **Data Integrity**: Checklist steps have dependency logic (earlier steps must be completed before unlocking later ones).
- **Security**: Mock local persistence is currently used; transition to Firebase for multi-user collaboration if requested.
