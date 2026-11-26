const notificationsKey = "wwallet-notifications-enabled";
const dailyReminderKey = "wwallet-daily-reminder-enabled";
const settingsChangedEvent = "wwallet-notification-settings-changed";

export function notificationsEnabled() {
  return localStorage.getItem(notificationsKey) === "true";
}

export function dailyReminderEnabled() {
  return localStorage.getItem(dailyReminderKey) === "true";
}

function announceSettingsChange() {
  window.dispatchEvent(new Event(settingsChangedEvent));
}

export async function enableNotifications() {
  if (!("Notification" in window)) {
    throw new Error("As notificações não são compatíveis com este navegador.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permita notificações no navegador para ativar este recurso.");
  }
  localStorage.setItem(notificationsKey, "true");
  announceSettingsChange();
}

export function disableNotifications() {
  localStorage.setItem(notificationsKey, "false");
  localStorage.setItem(dailyReminderKey, "false");
  announceSettingsChange();
}

export function setDailyReminder(enabled: boolean) {
  localStorage.setItem(dailyReminderKey, String(enabled));
  announceSettingsChange();
}

export function showAppNotification(title: string, body: string) {
  if (
    notificationsEnabled() &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, { body });
    } catch {
      // Notification display is optional and must not interrupt a saved action.
    }
  }
}

export function startDailyReminder() {
  let timer: number | undefined;

  const schedule = () => {
    window.clearTimeout(timer);
    if (
      !notificationsEnabled() ||
      !dailyReminderEnabled() ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const nextReminder = new Date();
    nextReminder.setHours(9, 0, 0, 0);
    if (nextReminder <= new Date()) nextReminder.setDate(nextReminder.getDate() + 1);
    timer = window.setTimeout(() => {
      showAppNotification("Lembrete do WWallet", "Que tal conferir suas finanças hoje?");
      schedule();
    }, nextReminder.getTime() - Date.now());
  };

  window.addEventListener(settingsChangedEvent, schedule);
  schedule();
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener(settingsChangedEvent, schedule);
  };
}
