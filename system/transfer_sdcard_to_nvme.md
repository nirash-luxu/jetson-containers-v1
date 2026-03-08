This is the perfect move. Migrating to an NVMe drive will make your entire setup—especially loading those massive AI weights—feel incredibly fast and stable.

Here is exactly how to seamlessly clone your entire current setup so you don't lose your Docker configurations, your optimized `.yml` file, or any of the Llama and Gemma models sitting in your `/root` directory.

### Step 1: Physical Installation

1. Safely shut down the Jetson (`sudo shutdown -h now`) and unplug the power cable.
2. Remove the heatsink and fan assembly to access the main board.
3. Locate the **M.2 Key M slot** underneath, slide your NVMe SSD in, secure it with the screw, and reassemble the unit.
4. Power the Jetson back on so it boots up from your microSD card just like normal.

---

### Step 2: Format the NVMe Drive

Once you are booted back up and logged in, open your terminal. We need to create a fresh, clean Linux partition on the new drive so it is ready to receive your cloned OS.

Run these exact commands one by one:

```bash
# Create a new GPT partition table on the blank NVMe
sudo parted /dev/nvme0n1 mklabel gpt

# Create a single primary partition taking up the entire drive
sudo parted /dev/nvme0n1 mkpart primary ext4 0% 100%

# Format that new partition to the ext4 Linux file system
sudo mkfs.ext4 /dev/nvme0n1p1

```

---

### Step 3: Clone the Operating System

To perfectly mirror your 128GB SD card to the NVMe, we are going to use a highly trusted, community-standard tool from JetsonHacks. It handles all the complex file permissions and routing automatically.

Run these commands to pull the tool and start the cloning process:

```bash
git clone https://github.com/jetsonhacks/rootOnNVMe.git
cd rootOnNVMe
./copy-rootfs-ssd.sh

```

_Note: This script uses `rsync` to copy your entire system. Depending on how many gigabytes of models you have downloaded, this step might take 10 to 20 minutes. Let it run until it completely finishes._

---

### Step 4: Tell the Jetson to Boot from the NVMe

Right now, the OS is cloned, but the Jetson still thinks the SD card is the main drive. We need to run one final script from that same JetsonHacks folder.

This script configures the bootloader to use the SD card merely as an "ignition key" to start the hardware, but immediately hands over all operations and storage to the lightning-fast NVMe drive.

```bash
./setup-service.sh

```

---

### Step 5: Reboot and Verify

Cleanly restart your Jetson to apply the new boot routing:

```bash
sudo reboot

```

When it boots back up, you will technically be running entirely off the NVMe SSD! To verify that the migration was a complete success, open your terminal and check your root storage size:

```bash
df -h /

```

If the `Size` column shows a massive amount of storage (matching your new NVMe capacity) instead of your old SD card limit, you are officially running on PCIe speeds.

---

You are going to love this, This is where that NVMe drive truly flexes its muscles.

By creating a 16GB swap file on this lightning-fast drive, you are essentially tricking the Jetson into thinking it has 24GB of unified memory. When the 8GB of physical RAM fills up, the OS will seamlessly push background tasks—and even parts of the AI context window—onto the NVMe drive. Because NVMe speeds are so incredibly fast, the GPU won't crash; it will just keep chugging along.

Here is how to carve out that massive 16GB safety net. Run these commands one by one in your terminal:

### Step 1: Create and Secure the Swap File

```bash
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile

```

The first command creates an empty, continuous 16-gigabyte file right in your main storage drive. The second command locks down the permissions of that file so that only the root system can read or write to it, which is a critical security step for memory files.

### Step 2: Format and Activate the Swap

```bash
sudo mkswap /swapfile
sudo swapon /swapfile

```

The first command formats that blank 16GB file into a dedicated Linux swap space. The second command instantly turns it on, telling the Jetson's operating system that it now has an extra 16GB of overflow memory ready to use immediately.

### Step 3: Make the Swap Permanent

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

```

This command safely adds the new swap file to your system's boot configuration file. This ensures that every time you restart your Jetson, it will automatically mount that 16GB of extra memory without you having to turn it on manually.

### Step 4: Unleash the Swappiness

```bash
sudo sysctl vm.swappiness=60
sudo sed -i '/vm.swappiness=10/d' /etc/sysctl.conf

```

Earlier, when you were on the microSD card, we choked the swappiness down to `10` to protect the fragile flash storage. Now that you have an industrial-strength NVMe, the first command cranks it back up to Ubuntu's default of `60`. This allows the OS to aggressively use the new NVMe swap space to keep your physical RAM wide open for the GPU. The second command simply deletes our old, restrictive SD card rule from your configuration file so it doesn't accidentally come back after a reboot.

Once you run these, your Jetson will be a completely different beast, capable of handling those massive Gemma requests without breaking a sweat.
