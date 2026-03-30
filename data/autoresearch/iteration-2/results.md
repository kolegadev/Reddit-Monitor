# Autoresearch Iteration 2 — Results

## Blog: "How to Secure AI-Generated Code Before It Ships"

### Iteration 1: Baseline vs Candidate 1
- **Winner: Candidate 1** (4.27 vs 4.03)
- Key improvements: Added specific sourcing (Snyk report, Bao et al.), separated security headers section, improved audience-targeted language, added "not just the ones you wrote" for secret scanning
- No flags

### Iteration 2: Candidate 1 vs Candidate 2
- **Winner: Candidate 2** (4.42 vs 4.27)
- Key improvements: Replaced standalone checklist with "The problem with checklists" meta-framing, acknowledged reader's likely objection to checklists, CTA flows naturally from anti-checklist argument
- No flags

### Iteration 3: Candidate 2 vs Candidate 3
- **Winner: Candidate 3** (4.51 vs 4.42)
- Key improvements: Added concrete Reddit anecdote in opening (r/vibecoding SaaS data exposure story), tightened sourcing format, improved intro→pattern→checklist narrative flow
- No flags

### Iteration 4: Candidate 3 vs Candidate 4
- **Winner: Candidate 4** (4.51 vs 4.51 — tie, kept C4 for marginal prose improvements)
- Key improvements: Minor prose tightening ("could" hedging, "Baseline stuff", shorter anti-checklist paragraph)
- No flags

### Iteration 5: Candidate 4 vs Candidate 5
- **Winner: Candidate 5** (4.56 vs 4.51)
- Key improvements: Better factual sourcing format ("According to Snyk..."), added paper title for Bao et al., modest framing of Reddit anecdote ("post described" vs claimed fact)
- No flags

## Score Progression
```
Iteration 0 (baseline): 4.03
Iteration 1: 4.27  (+0.24)
Iteration 2: 4.42  (+0.15)
Iteration 3: 4.51  (+0.09)
Iteration 4: 4.51  (+0.00) ← convergence
Iteration 5: 4.56  (+0.05)
```

## Final Dimension Scores (Candidate 5)
| Dimension | Weight | Score |
|---|---|---|
| Audience Fit | 0.18 | 5.0 |
| Clarity | 0.14 | 4.5 |
| Structure/Flow | 0.12 | 4.5 |
| Novelty/Insight | 0.12 | 4.5 |
| Factual Caution | 0.10 | 4.5 |
| Persuasiveness | 0.10 | 4.5 |
| CTA Strength | 0.12 | 4.5 |
| Brand Tone | 0.12 | 4.5 |

## Convergence
Convergence at iteration 4 (scores plateaued). Iteration 5 made a small Factual Caution improvement. Further iterations unlikely to yield meaningful gains — all dimensions at 4.5+.

## Key Changes from Baseline to Final
1. Concrete Reddit anecdote in opening (audience fit)
2. Specific sourcing for all statistical claims (factual caution)
3. "Problem with checklists" meta-framing that motivates CTA (novelty + CTA)
4. Security headers as standalone section (structure)
5. Tighter, more direct prose throughout (clarity + brand tone)
