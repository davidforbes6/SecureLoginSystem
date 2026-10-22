# Learning Git with this project

This repository is a real project with a real history: six versions of a login system, tests, a diary, a teaching website, and two merged pull requests. You can use it to learn Git by doing, without any risk to the original.

> **Golden rule:** practise on **your own copy** (a fork), never on the original repository's `main` branch. Anything you break in your fork stays in your fork.

---

## Part 0: Set up your own copy

1. Sign in to GitHub and open `https://github.com/davidforbes6/SecureLoginSystem`.
2. Click **Fork** (top right). GitHub makes a copy under your own account.
3. On your fork, click **Code → Local → Clone** and copy the HTTPS address.
4. In a terminal:

```bash
git clone https://github.com/<your-username>/SecureLoginSystem.git
cd SecureLoginSystem
git status
```

`git status` should say `On branch main` and `nothing to commit, working tree clean`. If it doesn't, ask for help before going further.

---

## Part 1: Explore the history (no commands needed)

Work through these on the GitHub website first.

1. **Code tab:** open `src/` and look at the six version files. Notice how each file's name shows its version.
2. **Commits:** click the clock icon with the number next to the branch name. Find the commit **"Add six login versions, tests and process diary"**. Click it and read the **Files changed** view. Green lines were added, red lines were removed.
3. **Branches:** click the branch dropdown. You will see `main` and the branch used for the pull requests.
4. **Pull requests:** open the **Pull requests** tab, then **#1** and **#2**. Read each description, then the **Conversation** and **Files changed** tabs.
5. **Blame:** open `src/login_v5_DavidForbes.py`, click **Blame**. Each line shows the commit that last changed it. Find the lines with the SHA-256 digests. Which commit changed them, and why? (Hint: look at the diary, section 2.)

---

## Part 2: Read the history from the terminal

```bash
git log --oneline --graph --all          # the whole history as a branch diagram
git log -3 --stat                        # the last three commits, with the files each changed
git show <commit-id> --stat              # details of one commit (use the first 7 characters of an ID)
git blame src/login_v4_DavidForbes.py    # who changed each line, and in which commit
```

Find the commit that added `docs/GIT_LEARNING.md` in the history with `git log --oneline -- docs/GIT_LEARNING.md`.

---

## Part 3: Make a branch and a small change

A **branch** is a separate line of work. Always make a branch before you change anything.

```bash
git switch -c add-my-name                # create a branch called add-my-name and switch to it
```

Open `README.md` in your editor and add a line near the top, for example:

```markdown
*Explored by <your name>.*
```

Now look at what you changed:

```bash
git status                  # which files changed
git diff                    # the exact lines that changed
git add README.md           # stage the change (put it in the "to be committed" box)
git commit -m "Add my name to the README"
git log --oneline -1        # check your commit is there
```

**Good commit messages:** start with a short verb in the imperative ("Add", "Fix", "Update"), keep the first line under about 50 characters, and say *why* in the body if it isn't obvious.

Publish your branch to your fork:

```bash
git push -u origin add-my-name
```

`-u` links your local branch to the one on GitHub, so later you can just type `git push`.

---

## Part 4: Open a pull request

1. On your fork, GitHub shows a banner **Compare & pull request** for `add-my-name`. Click it.
2. Check the **base** (where it will go) is your fork's `main`, not the original project.
3. Write a short description: what changed and why.
4. Click **Create pull request**, then **Merge pull request**, then **Confirm merge**.
5. Back in the terminal:

```bash
git switch main
git pull                    # bring your merged change down
git log --oneline -3        # your commit is now in main
```

Your branch can be deleted once merged (GitHub offers a button).

---

## Part 5: Make a mistake and recover

Practise undoing things, because everyone makes mistakes.

**Undo an unsaved change:**

```bash
# Change a line in tests/test_v1.py by accident, then:
git status
git restore tests/test_v1.py          # throw away the change to this file
```

**Break a test on purpose and see it fail:**

1. Open `tests/test_v1.py` and change `"Access Granted"` in `test_tc_v1_01_correct_login_succeeds` to `"Access Allowed"`.
2. Run the tests:

```bash
python -m unittest discover -s tests -v
```

3. Read the failure, then undo the change with `git restore tests/test_v1.py`.

**Save work temporarily with stash:**

```bash
# Edit README.md (don't commit it), then:
git stash                  # shelve the change
git status                 # clean again
git stash pop              # bring the change back
```

**Undo a commit that has already been shared, safely:**

```bash
git revert <commit-id>     # creates a NEW commit that reverses the old one
```

`git revert` keeps the history honest, so it is the safe choice for shared branches. Try it on your fork with the commit from Part 3.

**Dangerous, local only:** `git reset --hard` throws away uncommitted work and can delete commits from your branch. Never use it on a branch others have copied. Read the output of `git status` before using it.

---

## Part 6: Resolve a merge conflict

A conflict happens when two branches change the same line.

```bash
git switch main
git switch -c line-a
# edit line 1 of README.md, then:
git commit -am "Change the title (version A)"

git switch main
git switch -c line-b
# edit the SAME line 1 differently, then:
git commit -am "Change the title (version B)"

git switch main
git merge line-a            # fast-forward, no conflict
git merge line-b            # CONFLICT
```

Git stops and marks the file:

```
<<<<<<< HEAD
Your version
=======
The other version
>>>>>>> line-b
```

To fix it, edit the file to keep the text you want and delete the three marker lines. Then:

```bash
git add README.md
git commit                  # Git offers a merge message; save it
git log --oneline --graph -6
```

---

## Part 7: Look at a team's history (optional, with a partner)

1. Ask a partner to fork the project and make a change on a branch.
2. Each of you opens a pull request against the same original repository (if your teacher allows this).
3. Practise **reviewing**: on the **Files changed** tab, click a line and leave a comment, then **Approve** or **Request changes**.

---

## Key ideas

| Idea | What it means | Where you see it here |
|---|---|---|
| **Repository** | The project folder plus its complete history | This whole project |
| **Commit** | A saved snapshot with a message, author and date | `git log`, the Commits page |
| **Branch** | A movable label on a line of commits | `main`, `add-my-name` |
| **HEAD** | "Where I am now" (the current branch or commit) | `git status` shows it |
| **Remote** | Another copy of the repository, usually called `origin` | `git remote -v` |
| **Fork** | Your own copy of someone else's repository on GitHub | Your account |
| **Staging area** | The "to be committed" box between your edits and a commit | `git add`, `git status` |
| **Pull request** | A proposal to merge one branch into another, with review | The Pull requests tab |
| **Merge** | Combine two lines of history, keeping both sets of changes | `git merge`, PR #1 and PR #2 |
| **Conflict** | Two changes to the same lines that Git cannot join automatically | Part 6 |
| **Revert** | A new commit that undoes an earlier commit | Part 5 |
| **Stash** | A temporary shelf for uncommitted changes | Part 5 |
| **Blame** | The commit that last changed each line | `git blame`, Blame button |

---

## Cheat sheet

```bash
git status                    # what has changed
git diff                      # the exact changes, not yet staged
git add <file>                # stage a file
git commit -m "message"       # save a snapshot
git log --oneline --graph     # the history
git switch -c <name>          # new branch and switch to it
git switch <name>             # switch to an existing branch
git push -u origin <name>     # publish a branch
git pull                      # download and merge the latest changes
git restore <file>            # throw away unsaved changes to a file
git stash / git stash pop     # shelve and bring back changes
git revert <commit>           # undo a commit safely with a new commit
git blame <file>              # who changed each line
```

---

## Safety checklist

- Work on a branch, not on `main`.
- Run `git status` before every commit, so you know what you are committing.
- Never commit real passwords, keys or personal data. The passwords in this project are simulated for teaching only.
- Never use `git push --force` on a shared branch.
- The audit log `security_audit.log` is listed in `.gitignore`, so it is not committed by accident.

---

## Want to go further?

- Turn on GitHub Pages for **your fork** (Settings → Pages). Your own copy of the website then goes live at `https://<your-username>.github.io/SecureLoginSystem/`.
- Add a new lab or quiz question to `assets/content.js` on a branch, then open a pull request.
- Try `git rebase` on a practice branch to see how it differs from `git merge`.
