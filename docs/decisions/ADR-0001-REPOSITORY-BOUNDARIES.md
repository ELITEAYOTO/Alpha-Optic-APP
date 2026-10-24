# ADR-0001 — Separate Desktop and Bridge

Status: accepted design, implementation pending
Date: 2026-10-24

Optic Desktop lives in `ELITEAYOTO/Alpha-Optic-APP`, separate from Optic AI Bridge Rust. Desktop orchestrates UI and a constrained host; the Bridge alone owns permissions and sensitive service decisions.

Consequence: no source-copy or git-submodule dependency on Bridge source in frontend; exchange data over explicit authenticated versioned contracts. Contract changes need compatibility tests and coordination across repositories. Development is independently buildable in mock mode without claiming Bridge connectivity.
