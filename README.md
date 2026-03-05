Here is the complete, end-to-end guide to getting Ollama running on your Jetson Orin Nano, Nirash. This ensures maximum GPU performance while keeping strict control over your MicroSD card space.

### Step 1: Configure Docker for the Jetson GPU

First, we need to ensure Docker automatically passes your Orin Nano's GPU into its containers.

```bash
sudo nano /etc/docker/daemon.json

```

```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

```bash
sudo systemctl restart docker

```

The first command opens the Docker daemon configuration file. The JSON block defines the NVIDIA runtime and sets it as the default. The final command restarts the Docker service to apply these hardware passthrough settings.

---

### Step 2: Prepare the Directories

We need a dedicated space for the model weights and a folder for your configuration files.

```bash
mkdir -p ~/ollama_data
mkdir -p ~/ollama_compose
cd ~/ollama_compose

```

The first command creates the exact folder where all your heavy LLM weights will be stored on your MicroSD card. The second and third commands create and move you into a workspace for your deployment files.

---

### Step 3: Create the Docker Compose File

Now, we will define the service using the exact configurations optimized for JetPack 6.2.

```bash
nano docker-compose.yml

```

```yaml
services:
  ollama:
    image: dustynv/ollama:r36.4.0
    container_name: ollama_jetson
    runtime: nvidia
    restart: always
    network_mode: host
    volumes:
      - ~/ollama_data:/root/.ollama
    command: ["ollama", "serve"]
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Save and exit the file.

The configuration above uses the `dustynv` image built specifically for Jetson boards. It uses `network_mode: host` to make the API accessible on port 11434 on your local network. The `volumes` section maps the internal `.ollama` folder directly to the `~/ollama_data` folder you created earlier. The `logging` section restricts Docker from generating massive text logs that could quietly consume your remaining storage.

---

### Step 4: Deploy Ollama

With the configuration file saved, you can spin up the service.

```bash
docker compose up -d

```

This command downloads the specialized image and starts the Ollama server in the background.

---

### Step 5: Test the Deployment

Let's pull a small, highly efficient model to verify the GPU is working correctly.

```bash
docker exec -it ollama_jetson ollama run phi3

```

This command enters your running container and tells Ollama to download and run Microsoft's Phi-3 model. Because of the bind mount, the gigabytes of data for this model are being saved directly into your `~/ollama_data` folder.

---

### Step 6: The Clean-Up Protocol (Reclaiming 100% Space)

When you need to free up the MicroSD card, run these commands to completely wipe the deployment and recover every megabyte.

```bash
cd ~/ollama_compose
docker compose down
docker rmi dustynv/ollama:r36.4.0
sudo rm -rf ~/ollama_data
docker image prune -a

```

These commands stop and remove the container, delete the base NVIDIA Ollama image, forcefully delete the directory holding all the downloaded model weights, and finally clear out any dangling Docker cache layers.

Would you like me to show you how to connect this new local Ollama API to your n8n automation hub so you can start routing AI workflows through it?
