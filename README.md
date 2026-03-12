Here is the complete, end-to-end guide to getting Ollama running on your Jetson Orin Nano. This ensures maximum GPU performance while keeping strict control over your MicroSD card space.

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
    image: ollama/ollama:latest
    container_name: ollama_jetson
    command: serve
    runtime: nvidia
    shm_size: 4gb
    restart: always
    network_mode: host
    environment:
      - OLLAMA_FLASH_ATTENTION=1
      - OLLAMA_MODELS=/models
      - JETSON_JETPACK=6
    volumes:
      - /root/ollama_data:/models
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Save and exit the file.

The configuration above uses the `ollama` image built specifically for Jetson boards. It uses `network_mode: host` to make the API accessible on port 11434 on your local network. The `volumes` section maps the internal `.ollama` folder directly to the `~/ollama_data` folder you created earlier. The `logging` section restricts Docker from generating massive text logs that could quietly consume your remaining storage.

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
docker rmi ollama/ollama:latest
sudo rm -rf ~/ollama_data
docker image prune -a

```

These commands stop and remove the container, delete the base NVIDIA Ollama image, forcefully delete the directory holding all the downloaded model weights, and finally clear out any dangling Docker cache layers.

Here is a high-level breakdown of the architecture you just built. You essentially transformed your Jetson Orin Nano into a dedicated, hardware-accelerated AI microservice.

The Architecture of Your Local AI Node

1. The Hardware Bridge (NVIDIA Container Runtime)
   Standard Docker containers are isolated from the host machine's hardware, meaning they rely purely on the CPU. By modifying the daemon.json file to use the nvidia runtime, you created a direct bridge. This allows the Docker container to bypass the CPU and send heavy matrix multiplications directly to the Orin Nano's GPU, which is required for running LLMs at readable speeds.

2. The AI Engine (Official Jetson GPU Support Ollama Build)
   Standard Ollama Docker images are optimized for Official Jetson GPU processors. The ollama/ollama:latest image you deployed is specifically compiled for the Jetson's ARM64 architecture and JetPack 6.2 environment. It acts as the server, handling the API requests and loading the model weights into the GPU's memory.

3. The Storage Strategy (Bind Mounts)
   Running models like Llama 3 or Mistral requires downloading files that are several gigabytes in size. By default, Docker hides these inside abstract, hard-to-reach virtual volumes, which is dangerous for a 128GB MicroSD card. The bind mount (-v ~/ollama_data:/root/.ollama) forces the container to save those massive files into a standard, visible folder on your host OS. This guarantees that if you ever need that disk space back, simply deleting that single folder reclaims 100% of it.

4. The Network & Ecosystem (Host Mode)
   By using network_mode: host, the container shares the exact same IP address as your Jetson board. This turns the Jetson into a local API endpoint on port 11434. It can now act as the dedicated AI brain for your entire home lab. For example, your n8n automation hub running on the Raspberry Pi 5 can securely route workflows—like summarizing emails or analyzing logs from your 24/7 background bots—directly to the Jetson without ever sending that data out to the internet through your Cloudflare tunnel.
