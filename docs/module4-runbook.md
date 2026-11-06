# Module 4 runbook: what to run on your laptop

The code is written and committed locally. It has **not been compiled yet**, because Claude's workspace cannot reach Maven Central or Docker Hub. Step 1 is the first real build, so send any error output back to Claude.

Before you start:

- Docker Desktop is running.
- You have accounts on GitHub, Docker Hub, Render and Netlify.

## Where to type the commands

Every command in a grey box goes into **VS Code's built-in terminal**:

1. Unzip `module4-taskflow-docker.zip`, then open the `module4-taskflow-docker` folder in VS Code with **File > Open Folder**.
2. Open the terminal with **Terminal > New Terminal**, or press **Ctrl + `** (the backtick key, left of 1). It opens at the bottom, already inside the repo folder, which is the "repo root".
3. Check the shell's name on the right of the terminal panel. On Windows it should say **powershell**. If it says something else (cmd, bash), click the **˅** beside **+** and choose **PowerShell**.
4. When a step says "in a second terminal", click the **+** to open another one. Leave the first one running.

The `powershell` label at the top of each box only tells you which shell the command is for. Don't type it.

In PowerShell, use `curl.exe`, not `curl`: plain `curl` runs a different PowerShell command.

> **Decision needed before Step 3:** Render, Netlify and GitHub Actions all deploy *from GitHub*, so the code has to be pushed before Tasks 3 and 4 can happen. To keep to "don't submit until everything is done", create the repo as **Private**. Render, Netlify and Actions all work with private repos. Switch it to **Public** and submit the URL on NTU Learn only at the very end.

---

## Step 1: Task 2, build and test TaskFlow locally

From the repo root (`module4-taskflow-docker`):

```powershell
.\mvnw.cmd verify                      # optional: runs the unit tests first
docker build -t taskflow:latest .
docker run -p 8080:8080 taskflow:latest
```

In a second terminal:

```powershell
curl.exe http://localhost:8080/api/tasks
```

**What you should see:** a JSON list of the 4 sample tasks.

**Screenshot:** `screenshots/01-local-run.png`, showing the terminal with the build/run output and the curl result.

To check the TaskFlow frontend locally, keep the container running and run this in a third terminal:

```powershell
cd frontend
python -m http.server 8888
```

Then open http://localhost:8888. Port 8888 is already on the allowed list for CORS.

## Step 2: Simple CRM locally (Option 3 smoke test)

```powershell
cd simple-crm-api
docker compose up -d --build
curl.exe http://localhost:8411/customers
```

**What you should see:** 3 sample customers.

Then the React app:

```powershell
cd ..\simple-crm-web
npm ci
$env:VITE_API_BASE_URL = "http://localhost:8411"
npm run dev
```

Open http://localhost:5173 and log in with a demo user from `src/data/users.js`. Then check that customers load, and that adding, editing and deleting one all work.

When you're finished, stop the CRM containers:

```powershell
cd ..\simple-crm-api
docker compose down
```

## Step 3: Push to GitHub (private for now)

1. Create a GitHub repo called `module4-taskflow-docker` and set it to **Private**. Don't add a README, `.gitignore` or licence; it must start empty.
2. Push from the repo root:

   ```powershell
   git remote add origin https://github.com/Jefkong77/module4-taskflow-docker.git
   git push -u origin main
   ```

3. Add the secrets under **Settings > Secrets and variables > Actions > New repository secret**:

   | Secret | Value |
   |---|---|
   | `DOCKERHUB_USERNAME` | Your Docker Hub username |
   | `DOCKERHUB_TOKEN` | Docker Hub > Account settings > Personal access tokens > Generate (Read & Write) |
   | `NVD_API_KEY` | Free key from https://nvd.nist.gov/developers/request-an-api-key (it arrives by email) |

4. Go to **Actions > CI > Run workflow**. All 4 jobs should go green.

**Screenshot:** `05-actions-run.png`. Copy the run URL too.

## Step 4: Task 3, deploy TaskFlow API to Render

1. Render: **+ New > Web Service > GitHub**, then grant access to `module4-taskflow-docker`.
2. Settings:

   | Setting | Value |
   |---|---|
   | Language | Docker |
   | Root Directory | Leave blank |
   | Region | Singapore |
   | Instance type | Free |

3. Environment variables:

   | Variable | Value |
   |---|---|
   | `PORT` | `8080` |
   | `CORS_ALLOWED_ORIGINS` | Leave for now; you'll fill it in at Step 6 |
   | `OPENAI_API_KEY` | Optional; only needed for `/api/tasks/summary` |

4. Click **Deploy Web Service**, wait 3 to 5 minutes, then copy the `https://...onrender.com` URL.

## Step 5: Task 4, verify the TaskFlow deployment

```powershell
curl.exe https://<your-taskflow>.onrender.com/api/tasks
```

**Screenshots:**

- `03-render-deploy.png`: the Render dashboard showing the deploy as **Live**.
- `04-live-api.png`: the live URL working, in a browser or Postman.

## Step 6: Option 2, TaskFlow frontend on Netlify

1. Netlify: **Add new site > Import an existing project > GitHub**, then pick the repo.
2. Set the **Base directory** to `frontend`. `frontend/netlify.toml` supplies the rest of the build settings.
3. Add the environment variable `TASKFLOW_API_URL` = `https://<your-taskflow>.onrender.com`. Use the bare URL, without `/api/tasks`.
4. Deploy, then copy the Netlify URL.
5. Back on Render (TaskFlow service), set `CORS_ALLOWED_ORIGINS` = `https://<your-site>.netlify.app`. Render redeploys automatically.

**Screenshot:** `10-frontend.png`, showing the Netlify page listing tasks with **API online**.

## Step 7: Option 4, versioned images

```powershell
git tag v1.0.0
git push origin v1.0.0
```

Make any small change and commit it, then:

```powershell
git tag v1.1.0
git push origin v1.1.0
```

Docker Hub should now show these tags: `1.0.0`, `1.0`, `1.1.0`, `1.1`, `sha-xxxxxxx` and `latest`.

**Screenshot:** `06-docker-tags.png`, the Docker Hub Tags page.

## Step 8: Option 5, security evidence

Open the CI run and download these artifacts:

- `dependency-check-report`
- `trivy-report`
- `test-reports`

Send the two reports to Claude, which will summarise the findings and fixes for the README.

**Screenshot:** `07-security-scans.png`, the green security jobs.

## Step 9: Option 3, Simple CRM on Render + Netlify

1. Render: **+ New > PostgreSQL**. Region Singapore, Free plan.
2. Open the database's **Connections** panel and note the **internal** hostname, database name, username and password.
3. Render: **+ New > Web Service**, same repo. Set **Root Directory** to `simple-crm-api` and Language to Docker.
4. Environment variables. Paste these into Render only, never into a file in the repo.

   | Variable | Value |
   |---|---|
   | `PORT` | `8080` |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<internal-host>:5432/<database>` |
   | `SPRING_DATASOURCE_USERNAME` | The database username |
   | `SPRING_DATASOURCE_PASSWORD` | The database password |
   | `CORS_ALLOWED_ORIGINS` | Fill in after the next step |

   Render's "Internal Database URL" starts with `postgres://`. Spring needs the `jdbc:postgresql://host:5432/db` format above, with the username and password supplied separately.

5. Netlify: add a **second** site from the same repo. Set the **Base directory** to `simple-crm-web` and add the environment variable `VITE_API_BASE_URL` = `https://<your-crm-api>.onrender.com`.
6. Set `CORS_ALLOWED_ORIGINS` on the CRM API to the CRM Netlify URL.

**Screenshots:** `11-simple-crm-api.png` and `12-simple-crm-web.png`.

## What to send back to Claude

- Every URL: both Render services, both Netlify sites, the Docker Hub repo and the green Actions run.
- Every error, pasted as text, plus a screenshot if you have one. Errors go in the README too; the PDF counts documented failures.
- The security reports from Step 8.

Claude then writes the README with the infographic, as the final step. After that you make the repo public and submit the URL on NTU Learn.
