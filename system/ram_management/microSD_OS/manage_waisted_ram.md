Here is your complete, master runbook for stripping Ubuntu down to its bare essentials and reclaiming every possible megabyte of RAM for your AI models.

Since you are running your OS on a microSD card, this setup specifically protects your storage from burning out while forcing the Jetson to dedicate all its physical memory to the GPU.

Run these commands one by one in your terminal:

### Step 1: Kill the Desktop Environment (Headless Mode)

This is the big one. It stops the Jetson from loading the desktop GUI, instantly freeing up roughly 2GB of RAM.

```bash
sudo systemctl set-default multi-user.target

```

### Step 2: Optimize Swappiness for the MicroSD Card

Because we are keeping ZRAM to protect your SD card, we need to tell the operating system to only use it as an absolute last resort. This forces the system to prioritize your physical RAM for the heavy AI lifting.

First, apply it immediately:

```bash
sudo sysctl vm.swappiness=10

```

Next, make it permanent so it survives a reboot:

```bash
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

```

### Step 3: Disable the Camera Daemon

If you don't have physical camera modules plugged into the ribbon slots on the Jetson board, this background service is just sitting there eating memory. Let's turn it off.

```bash
sudo systemctl stop nvargus-daemon
sudo systemctl disable nvargus-daemon

```

### Step 4: Disable Ubuntu File Indexing

Ubuntu constantly scans your files in the background to make desktop searches faster. Since you are now running a headless server, this is completely unnecessary.

```bash
systemctl --user mask tracker-store.service tracker-miner-fs.service tracker-miner-rss.service tracker-extract.service tracker-miner-apps.service tracker-writeback.service

```

### Step 5: Clear Caches and Reboot

Finally, let's flush out all the fragmented memory caches and cleanly reboot the system so it boots up into its new, ultra-lean state.

```bash
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
sudo reboot

```

---

### What to Expect After the Reboot

When your Jetson boots back up, your monitor will just show a black screen with a text login prompt—this means it worked perfectly. You can SSH back into it from your main computer just like always.

Your Docker Compose file is already set to `restart: always`, so Ollama will automatically spin up in the background. You should now have right around **7GB of completely free RAM**, which is plenty of room for `gemma3:4b` to stretch out without crashing.

---

Here is the complete runbook to revert every single optimization we just applied and return your Jetson Orin Nano exactly to its default state.

Run these commands one by one in your terminal:

### Step 1: Restore the Desktop Environment (GUI)

```bash
sudo systemctl set-default graphical.target

```

This command tells Ubuntu to boot back into the full graphical desktop environment on the next startup.

### Step 2: Reset Swappiness to Default

```bash
sudo sysctl vm.swappiness=60
sudo sed -i '/vm.swappiness=10/d' /etc/sysctl.conf

```

The first command instantly sets the swappiness back to Ubuntu's standard default value of 60. The second command safely deletes the custom rule we added to your configuration file so it doesn't reapply after a reboot.

### Step 3: Re-enable the Camera Daemon

```bash
sudo systemctl enable nvargus-daemon
sudo systemctl start nvargus-daemon

```

This turns the background service for physical MIPI cameras back on and ensures it launches automatically whenever the device boots up.

### Step 4: Unmask Ubuntu File Indexing

```bash
systemctl --user unmask tracker-store.service tracker-miner-fs.service tracker-miner-rss.service tracker-extract.service tracker-miner-apps.service tracker-writeback.service

```

This restores the background Tracker services so Ubuntu can resume indexing your files for fast desktop searches.

### Step 5: Reboot

```bash
sudo reboot

```

This cleanly restarts the system to apply all the restored settings. When the Jetson powers back on, your monitor will load straight into the standard Ubuntu desktop interface.

---

Here is the ultimate, hyper-aggressive runbook specifically engineered for the microSD card.

The core difference here is how we treat the swap memory. Because you are on flash storage, we are going to combine the extreme bloatware removal with the strict `swappiness=10` rule. This ensures we strip out every useless background app while fiercely protecting your SD card from burning out under heavy AI loads.

Run these phases one by one in your terminal to create the absolute leanest environment possible.

### Phase 1: Protect the SD Card (The Golden Rule)

First, we lock down the system's memory management so it prioritizes your physical RAM and avoids thrashing your fragile microSD card with overflow data.

```bash
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

```

### Phase 2: Kill the GUI and Heavy Daemons

Next, we strip away the desktop environment, the camera background services, and the file indexers.

```bash
# Disable the GUI (Headless Mode)
sudo systemctl set-default multi-user.target

# Disable the Camera Daemon
sudo systemctl stop nvargus-daemon
sudo systemctl disable nvargus-daemon

# Disable Ubuntu File Indexing (Tracker)
systemctl --user mask tracker-store.service tracker-miner-fs.service tracker-miner-rss.service tracker-extract.service tracker-miner-apps.service tracker-writeback.service

```

### Phase 3: Aggressive Hardware & Updater Removal

Now we kill the unused hardware scanners (printers, cell modems, Bluetooth) and the background telemetry/update checkers that sit in your RAM doing nothing.

```bash
sudo systemctl disable --now cups.service cups.socket ModemManager.service bluetooth.service packagekit.service whoopsie.service

```

### Phase 4: Purge Snapd (The RAM Hog)

We completely obliterate Ubuntu's heavy background package manager, which frees up a massive chunk of memory and reduces unnecessary background read/write cycles on your SD card.

```bash
sudo apt autoremove --purge snapd -y

```

### Phase 5: Flush and Reboot

Finally, we clear out any lingering data fragments and cleanly restart the hardware.

```bash
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
sudo reboot

```

### The Result

When your Jetson boots back up, it will be running on absolute bare metal. You will have maximum physical RAM available for your GPU, and your microSD card will be safely shielded from heavy swap abuse.
