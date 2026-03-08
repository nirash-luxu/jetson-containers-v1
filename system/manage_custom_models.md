Controlling the context window is the ultimate trick for squeezing larger AI models into tight RAM limits.

Here is a deeper explanation of how this works, followed by exactly where and how to run the commands.

### Why Lowering the Context Window Works

The "context window" is the model's short-term memory—it is the blank notepad where it remembers your current conversation.

When you load a model, Ollama reserves RAM not just for the model's core files (the weights), but also a massive chunk of RAM for that notepad. Many newer models default to a massive 8,192 token context window. By forcing the model to use a smaller window (like 2,048 tokens), you drastically shrink the size of that notepad, instantly freeing up gigabytes of memory so the model doesn't crash the GPU.

### From Which Directory Do You Run This?

Because you are using Docker, you can actually run the execution commands from **any directory** on your Jetson's terminal.

However, the configuration file we are going to create (called a `Modelfile`) **must** be saved inside your `/root/ollama_data` folder. Because we bridged that specific folder to the container earlier, placing the file there guarantees the isolated Docker container can actually see it and read it.

Here is the step-by-step process.

### Step 1: Create the Modelfile

Run this command in your Jetson terminal (from any directory):

```bash
sudo nano /root/ollama_data/Modelfile

```

This command opens a text editor directly inside your bridged storage folder and creates a new blank file named `Modelfile`.

### Step 2: Set the Context Rules

Paste these exact two lines into that blank file:

```text
FROM gemma3:4b
PARAMETER num_ctx 2048

```

The first line tells Ollama which base model to use. The second line forces the engine to cap the memory reservation for conversation history at 2,048 tokens.

Press `Ctrl+O`, hit `Enter` to save, and then press `Ctrl+X` to exit the text editor.

### Step 3: Build the Custom Model

Run this command in your terminal (again, from any directory):

```bash
docker exec -it ollama_jetson ollama create gemma3-lowctx -f /models/Modelfile

```

This command reaches inside your running `ollama_jetson` container and tells it to build a brand new model named `gemma3-lowctx`. The `-f /models/Modelfile` flag tells the container exactly where to find the instructions. Notice that we use `/models` here instead of `/root/ollama_data` because we have to use the container's internal folder name.

Once the terminal says "success," your custom, memory-efficient model is ready. You can run it anytime by typing:

```bash
docker exec -it ollama_jetson ollama run gemma3-lowctx

```

---

To completely wipe this custom model from existence so that absolutely zero trace of it remains on your Jetson, you just need to do two things: delete the model from Ollama's internal registry, and then delete the physical text file you created.

Here are the exact commands to make it like it never happened.

### Step 1: Delete the Custom Model from Ollama

Run this command in your terminal. It tells the Docker container to hunt down the `gemma3-lowctx` model and permanently delete its internal registration and associated files:

```bash
docker exec -it ollama_jetson ollama rm gemma3-lowctx

```

### Step 2: Delete the Physical Modelfile

Next, we need to delete the instruction file you created in your storage folder. Run this command to permanently remove it from your drive:

```bash
sudo rm /root/ollama_data/Modelfile

```

### Step 3 (Optional): Delete the Base Model

If your goal is to wipe _everything_ related to this experiment and free up the maximum amount of space on your NVMe drive, you can also delete the original heavy Gemma model that you used as the base.

```bash
docker exec -it ollama_jetson ollama rm gemma3:4b

```

Once you run these commands, your Jetson's storage and Ollama's internal database are completely scrubbed clean of those files. There will be no hidden caches or leftover data eating up your drive.
