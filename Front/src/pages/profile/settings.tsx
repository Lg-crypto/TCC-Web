import { useEffect, useState } from "react";
import SettingsSideMenu from "../../components/layout/settingsSideMenu";
import Window from "../../components/layout/window";
import {
  dailyReminderEnabled,
  disableNotifications,
  enableNotifications,
  notificationsEnabled,
  setDailyReminder,
} from "../../services/notifications";
import {
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "../../services/theme";
import styles from "./settings.module.css";

export default function Settings() {
  const [theme, setTheme] = useState<ThemePreference>(readThemePreference);
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [dailyReminder, setDailyReminderState] = useState(dailyReminderEnabled);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    saveThemePreference(theme);
  }, [theme]);

  const changeNotifications = async (enabled: boolean) => {
    setNotificationError("");
    if (!enabled) {
      disableNotifications();
      setNotifications(false);
      setDailyReminderState(false);
      return;
    }
    try {
      await enableNotifications();
      setNotifications(true);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar as notificações.",
      );
    }
  };

  const changeDailyReminder = async (enabled: boolean) => {
    setNotificationError("");
    if (!enabled) {
      setDailyReminder(false);
      setDailyReminderState(false);
      return;
    }
    try {
      if (!notifications) {
        await enableNotifications();
        setNotifications(true);
      }
      setDailyReminder(true);
      setDailyReminderState(true);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar o lembrete.",
      );
    }
  };

  return (
    <section className={styles.container}>
      <SettingsSideMenu />
      <Window width="65vw" height="90vh" className={styles.content}>
        <h2 className={styles.title}>Interface</h2>
        <div className={styles.settingsRow}>
          <label htmlFor="ThemeSelect">Tema da interface</label>
          <select
            className={styles.select}
            name="ThemeSelect"
            id="ThemeSelect"
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemePreference)}
          >
            <option value="automatic">Automático</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        <div className={styles.settingsRow}>
          <span>Idioma da interface</span>
          <span className={styles.currentValue}>Português</span>
        </div>

        <h2 className={styles.title}>Notificações</h2>
        <div className={styles.settingsRow}>
          <label htmlFor="NotifyCheck">Mostrar notificações</label>
          <input
            className={styles.check}
            type="checkbox"
            name="NotifyCheck"
            id="NotifyCheck"
            checked={notifications}
            onChange={(event) => void changeNotifications(event.target.checked)}
          />
        </div>
        <div className={styles.settingsRow}>
          <label htmlFor="ReminderCheck">
            Lembrete diário <small>(com o app aberto)</small>
          </label>
          <input
            className={styles.check}
            type="checkbox"
            name="ReminderCheck"
            id="ReminderCheck"
            checked={dailyReminder}
            onChange={(event) => void changeDailyReminder(event.target.checked)}
          />
        </div>
        {notificationError && (
          <p className={styles.notificationError} role="alert">
            {notificationError}
          </p>
        )}
        <p className={styles.note}>
          O lembrete diário é enviado às 9h e depende da permissão de
          notificações do navegador.
        </p>
      </Window>
    </section>
  );
}
