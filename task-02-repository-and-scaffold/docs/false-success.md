# docs/false-success.md

**What the user saw:**
When the sign-up form was submitted, the interface correctly caught the failure and displayed a red error banner stating, "An unexpected error occurred while creating your account. Please try again." The application halted the flow and kept the user on the sign-up page.

**What actually happened:**
Under the hood, the Next.js API route attempted to invoke Prisma to check for an existing user and create a new record. However, because the `DATABASE_URL` environment variable was altered, Prisma threw an `InitializationError` ("Environment variable not found: DATABASE_URL"). This caused the server to abort the operation and return a `500 Internal Server Error` status code instead of a 201 Created. No data was written to the database.

**How a person reviewing this product in a demo would have been fooled:**
In this specific build, the error was properly handled and displayed to the user. However, a "false success" occurs when a developer implements an *optimistic UI* without strict error boundaries. If this error handling had not been explicitly programmed, a demo could have easily been fooled: the frontend might have cleared the form, shown a green "Account Created" toast, and immediately routed the user to a dashboard, completely ignoring the 500 error silently failing in the background console. The stakeholder would watch a perfectly smooth, "successful" sign-up flow, entirely unaware that the database connection was dead and the user data was lost. This demonstrates why interface behavior can be deceiving, and why raw database logs and explicit HTTP 201 status codes are the only definitive proof of a successful write.