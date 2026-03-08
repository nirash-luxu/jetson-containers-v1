Here is the complete, master runbook engineered specifically for your NVMe setup.

This version combines the aggressive RAM-claiming strategies with the high-speed NVMe 16GB swap file we discussed. It strips Ubuntu down to its absolute bare metal and unleashes the NVMe drive to handle heavy AI overflow safely and rapidly.

Run these phases one by one in your terminal:

### Phase 1: Create the High-Speed 16GB Swap File

```bash
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=60
echo 'vm.swappiness=60' | sudo tee -a /etc/sysctl.conf

```

The commands above carve out 16GB of secure space on your NVMe drive, format it as swap memory, turn it on, and make it permanent across reboots. Crucially, the final two lines set your system's swappiness to 60, encouraging Ubuntu to actively offload background tasks to the lightning-fast NVMe drive, keeping your physical RAM wide open for the GPU.

### Phase 2: Kill the GUI and Heavy Daemons

```bash
sudo systemctl set-default multi-user.target
sudo systemctl stop nvargus-daemon
sudo systemctl disable nvargus-daemon
systemctl --user mask tracker-store.service tracker-miner-fs.service tracker-miner-rss.service tracker-extract.service tracker-miner-apps.service tracker-writeback.service

```

These commands boot the system into headless terminal mode (freeing ~2GB of RAM), permanently disable the background camera services, and mask all of Ubuntu's file-indexing trackers so they stop scanning your drive in the background.

### Phase 3: Aggressive Hardware & Updater Removal

```bash
sudo systemctl disable --now cups.service cups.socket ModemManager.service bluetooth.service packagekit.service whoopsie.service

```

This permanently disables the dead-weight background services sitting in your RAM. It kills the printer server, cellular modem scanner, Bluetooth daemon, automated background update checkers, and the Ubuntu crash reporter.

### Phase 4: Purge Snapd (The RAM Hog)

```bash
sudo apt autoremove --purge snapd -y

```

This command completely obliterates Ubuntu's heavy background package manager, unmounting its virtual drives and freeing up a massive chunk of idle memory.

### Phase 5: Flush and Reboot

```bash
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
sudo reboot

```

This clears out all fragmented memory caches and safely restarts your Jetson. When it boots up, you will have a hyper-optimized, pure AI host with essentially zero bloatware and a massive 16GB safety net.

---

### The Complete Revert Runbook (NVMe Edition)

If you ever need to undo this entirely and restore the Jetson to its stock, desktop-friendly Ubuntu state without the heavy swap file, run these commands:

**Step 1: Remove the NVMe Swap File**

```bash
sudo swapoff -v /swapfile
sudo rm /swapfile
sudo sed -i '/\/swapfile/d' /etc/fstab
sudo sed -i '/vm.swappiness=60/d' /etc/sysctl.conf

```

This safely turns off the overflow memory, deletes the 16GB file to give you your storage space back, and removes the custom swappiness and mounting rules from your configuration files.

**Step 2: Restore the Desktop Environment (GUI)**

```bash
sudo systemctl set-default graphical.target

```

This tells the operating system to load the full desktop GUI on the next boot.

**Step 3: Re-enable the Camera Daemon and File Indexing**

```bash
sudo systemctl enable nvargus-daemon
sudo systemctl start nvargus-daemon
systemctl --user unmask tracker-store.service tracker-miner-fs.service tracker-miner-rss.service tracker-extract.service tracker-miner-apps.service tracker-writeback.service

```

This turns the physical MIPI camera background services back on and allows Ubuntu to resume indexing your files for desktop searches.

**Step 4: Re-enable Hardware & Updaters**

```bash
sudo systemctl enable --now cups.service cups.socket ModemManager.service bluetooth.service packagekit.service whoopsie.service

```

This restores all the standard desktop background services (printers, Bluetooth, updaters, and crash reporting) so the OS functions normally.

**Step 5: Reinstall Snapd**

```bash
sudo apt update
sudo apt install snapd -y

```

This downloads and reinstalls Ubuntu's default package manager.

**Step 6: Reboot**

```bash
sudo reboot

```

This cleanly restarts the system to apply all restored settings.
