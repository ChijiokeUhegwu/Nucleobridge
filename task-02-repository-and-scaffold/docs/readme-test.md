# readme-test.md

**The Test:**
I asked a colleague who had never seen the Nucleobridge project to clone the repository and get the application running locally, relying exclusively on the README provided in the task-02-repository-and-scaffold task folder.

**What they got stuck on (Verbatim feedback):**
"I cloned the repo and opened the folder, but there are no setup instructions here. I see a description of the project, but there is no section telling me what commands to run to install dependencies, set up the environment variables, or start the database."

**How I fixed the README:**
The initial setup instructions were located entirely in the root repository README, which meant that anyone trying to clone the project had to navigate there. To fix this, I added a clear, self-contained "Getting Started" section directly into the folder's README. I explicitly listed the exact terminal commands required to run the project from a fresh clone, including `npm install`, copying the `.env.example` file, running `npx prisma migrate dev`, and starting the server with `npm run dev`. This ensures the document is fully actionable without relying on external files.