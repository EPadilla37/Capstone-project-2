import { app } from "./app.js";
const PORT = process.env.PORT || 3005;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
