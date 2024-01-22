#  The infield fly rule in baseball

One of the more obscure rules of baseball is the Infield Fly Rule. Intended to prevent unfair gamesmanship on the part of the defense, the infield fly rule applies when there are fewer than 2 outs, and there are runners on first and second base, or on first, second and third base. In these situations, if a fair fly ball is hit that, in the umpire's judgment, is catchable by an infielder with ordinary effort, the batter is out regardless of whether the ball is actually caught in flight. The rule states that the umpire is supposed to announce, "Infield fly!"

Any fair fly ball that can be caught by an infielder with ordinary effort is covered by this rule, regardless of where the ball is caught. The ball need not be caught by an infielder, nor must it be caught in the infield. 

How would we automate the umpire's decision using Corticon?

Sometimes the most challenging aspects of building rule models lie in the Vocabulary design. Without guidance from an existing data or fact model, we must rely on the terms and relationships present or implied in the rules themselves to assemble a usable Vocabulary. This puzzle offers many possible Vocabulary structures, ranging from ultra-simple (and probably unrealistic) to much more complex, realistic, and inevitably, more challenging to build rules with. The most basic form of Vocabulary is often one that has had its relationships removed or “flattened”. By contrast, in a “relational” model, many of an entity’s attributes would probably belong to other, associated entities. In the Infield Fly example, a “flat” Vocabulary might look like this:

![Alt text](<images/infield fly 1.png>)

This Vocabulary has a single entity named Game, with attributes like call and runnerOnFirst, which could also have been modeled as separate associated entities Call and Runner. Many calls are made in the course of a game, so a more realistic, relational Vocabulary might include a one-to-many association between entities Game and Call. 

The benefit of using the relational model comes when we model rules involving collections of calls. For example, how many calls of a particular type were made during the game? A flat Vocabulary like the one shown doesn’t allow us to consider more than one call per game. But while overly simplified, the Vocabulary shown above does give us the basic terms we need to model the Infield Fly Rule and solve the problem, which is our most immediate need!

![](<images/infield fly 2.png>)

You may notice that modeling the rules as shown above leads to a redundancy: when the bases are loaded and all other conditions of the Infield Fly Rule are satisfied, then both rules 1 and 2 will fire, causing our outs attribute in Action row 2 to be incremented twice. Let’s try it:

![](<images/infield fly 3.png>)

Clearly, we don’t want this to happen, since the whole point of the Infield Fly Rule is to prevent an unfair double play! We can stop this from occurring by eliminating the redundancy with the Compress Rules feature of Studio. Click to activate, and our two rule columns are “compressed” into a single column that looks identical to the original rule 1.

![](<images/infield fly 4.png>)

![](<images/infield fly 5.png>)

It appears as if rule 2 has disappeared, although it’s really been “subsumed” by another rule (in column 1) that includes rule 2’s logic as well as its own. Rerunning the same test, the new Results Testsheet is shown below:

![](<images/infield fly 6.png>)