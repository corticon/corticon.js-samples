# Authoring the Rules

Corticon provides domain experts with the tools to define the parts of software guided by complex rules, without needing to be programmers.

Logic is authored and tested in Corticon Studio through Rule Modeling in a spreadsheet decision-table interface called *Rulesheets*.  A rule is like an ‘if-then’ statement. Each rule consists of one or more conditions (if) that are associated with one or more actions (then).

<p>
  <img  src="https://cdn.jsdelivr.net/gh/corticon/corticon.js-samples/DynamicForms/docs/images/rulesheet%20overview.png" title="rulesheet  overview" >
</p>

## Logical Integrity Checks

Rulesheets also provide rule modelers with multiple click-of-a-button Logical Integrity Checks which identify incompleteness, conflict between rules, and infinite loops. 

### Rule completeness
Determines the completeness of the rule set (creates rules to fill in gaps).

### Rule ambiguity
Determines if rules are in conflict (overlapping conditions).

### Logical Loops
Detects logical loops in rule interaction that may need special attention.

[Rule Authoring](../assets/Rule%20Authoring.mp4  ':include')
