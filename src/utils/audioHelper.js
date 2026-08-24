// Audio helper - Permanently muted / sound disabled

class AudioHelper {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
  }

  init() {}
  playIncomingRideAlert() {}
  playBookingConfirmed() {}
  playOtpChime() {}
  playAlert() {}
  toggleMute() { return true; }
}

export const audioHelper = new AudioHelper();
