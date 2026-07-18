import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useMuseums } from '../contexts/MuseumsContext';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapClickHandler({ onClickCoords }) {
  useMapEvents({ click(e) { onClickCoords([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14); }, [JSON.stringify(center)]);
  return null;
}

const _markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const aL = {
  uz: {
    backToSite: "← Saytga qaytish", signOut: "Chiqish",
    tabNews: "Yangiliklar & Afisha", tabExposition: "Ekspozitsiya", tabAdmins: "Admin Hisoblar",
    dashTitle: "Boshqaruv paneli", dashSub: "Xush kelibsiz! Bugungi holat.", dashDownload: "Hisobot yuklab olish",
    dashVisits: "Jami tashriflar", dashToday: "Bugun", dashAvgQuiz: "O'rtacha test natijasi",
    dashWeekChart: "7 kunlik tashriflar", dashActivity: "So'nggi faollik", dashViewAll: "Hammasini ko'rish →",
    dashQuizByMuseum: "Muzeylar bo'yicha test natijalari",
    musTitle: "Muzeylar bazasi", musSub: (n) => `Farg'ona vodiysidagi ${n} ta muzey.`,
    musAdd: "+ Yangi muzey qo'shish", musNewHeading: "Yangi muzey", musEditHeading: (id) => `Tahrirlash: ${id}`,
    musFieldId: "ID (kichik lotin harflar, bo'shliksiz)", musFieldCity: "Shahar", musFieldPhone: "Telefon",
    musFieldEstablished: "Tashkil etilgan yil", musFieldBirth: "Muallif tug'ilgan yili", musFieldDeath: "Muallif vafot etgan yili",
    musFieldGps: "GPS koordinatalar — xaritani bosib belgi qo'ying", musFieldHero: "Bino fotosi (asosiy rasm)",
    musTranslations: "Tarjimalar", musFieldName: "Muzey nomi", musFieldOwner: "Shoir / egasi ismi",
    musFieldRole: "Lavozim / roli", musFieldLifespan: "Yashagan yillari (lifespan)", musFieldAddress: "Manzil",
    musFieldFounded: "Tashkil etilgan sana", musFieldHours: "Ish vaqti", musFieldEntry: "Kirish narxi",
    musFieldBio: "Biografiya", musPlaceholderHours: "Du–Sha, 9:00–18:00", musPlaceholderEntry: "Kattalar: 15 000 so'm · Bolalar: 5 000 so'm",
    musSave: "Saqlash", musCancel: "Bekor qilish",
    tblMuseum: "Muzey", tblCity: "Shahar", tblStatus: "Holat", tblActions: "Amallar", tblActive: "Faol", tblEdit: "Tahrirlash", tblDelete: "O'chirish",
    expTitle: "Muzey Ekspozitsiyasi (Eksponatlar)", expNoExhibits: (l) => `${l.toUpperCase()} tilidagi eksponatlar yo'q.`,
    expExhibitTitle: "Eksponat nomi", expDescription: "Tavsif", expImage: "Eksponat rasmi",
    chronoTitle: "Hayot xronologiyasi", chronoSub: "Muzey shaxsining biografik voqealari (yil va matn). Ochiq sahifada va umumiy /timeline sahifasida ko'rsatiladi.",
    chronoNone: (l) => `${l.toUpperCase()} tilida yozuvlar yo'q.`,
    chronoYearLabel: "Yil", chronoTextLabel: "Voqea matni",
    chronoAdd: "Voqea qo'shish", chronoAddTitle: (l) => `Yangi yozuv (${l.toUpperCase()})`,
    chronoSave: "Saqlash", chronoCancel: "Bekor", chronoDelete: "O'chirish",
    chronoDeleteConfirm: "Bu yozuvni o'chirish?", chronoYearPlaceholder: "Masalan: 1856",
    chronoTextPlaceholder: "Voqea tavsifi…", chronoYearRequired: "Yil kiriting",
    chronoTextRequired: "Voqea matnini kiriting",
    expSave: "Saqlash", expCancel: "Bekor qilish", expEdit: "Tahrirlash", expDelete: "O'chirish",
    expDeleteConfirm: "Bu eksponatni o'chirishni tasdiqlaysizmi?", expAddTitle: (l) => `Eksponat qo'shish (${l.toUpperCase()})`,
    expAddExhibit: "Eksponat qo'shish",
    newsTitle: (l) => `Yangiliklar (${l.toUpperCase()})`, newsNone: "Yangilik yo'q.", newsAddTitle: "Yangilik qo'shish",
    newsFieldTitle: "Sarlavha", newsFieldImage: "Yangilik rasmi", newsFieldContent: "Matn",
    newsDeleteConfirm: "Bu yangilikni o'chirishni tasdiqlaysizmi?", newsDelete: "O'chirish", newsPost: "E'lon qilish",
    eventsTitle: (l) => `Kelgusi tadbirlar (${l.toUpperCase()})`, eventsNone: "Tadbirlar yo'q.", eventsDateLabel: "Sana:",
    eventsDeleteConfirm: "Bu tadbirni o'chirishni tasdiqlaysizmi?", eventsDelete: "O'chirish",
    eventsAddTitle: "Tadbir qo'shish", eventsFieldTitle: "Sarlavha", eventsFieldDate: "Sana",
    eventsFieldImage: "Tadbir rasmi", eventsFieldDesc: "Tavsif", eventsSchedule: "Jadvalga qo'shish",
    quizActiveTitle: "Faol test savollari", quizNone: "Test savollari yo'q.", quizDelete: "O'chirish",
    quizAddTitle: "Test savoli qo'shish", quizSelectMuseum: "Muzeyni tanlang",
    quizQuestion: (l) => `Savol matni (${l.toUpperCase()})`, quizOptions: (l) => `Javob variantlari (${l.toUpperCase()})`,
    quizCorrect: "To'g'ri javob indeksi", quizAddBtn: "Savol qo'shish",
    settingsTitle: "Sayt tarjimalari sozlamalari", settingsSub: "Asosiy veb-sayt interfeysini lokalizatsiya qilish.",
    settingsSave: "Barcha tarjimalarni saqlash", settingsSearch: "Kalit so'z yoki tarjima matnini qidiring...",
    settingsNotFound: "Mos tarjima topilmadi.", settingsUiKey: "UI Tarjima kaliti",
    neTitle: "Yangiliklar & Afisha", neSub: "Barcha muzeylar uchun e'lonlar va tadbirlarni boshqaring.",
    neSubNews: "Yangiliklar", neSubEvents: "Tadbirlar", neLoading: "Yuklanmoqda…",
    neNewsNone: "Yangiliklar yo'q", neAllMuseums: "Barcha muzeylar",
    neDeleteNewsConfirm: "Bu yangilikni o'chirish?", neDeleteError: "O'chirib bo'lmadi", neDeleteBtn: "O'chirish",
    neEventsNone: "Tadbirlar yo'q", neDeleteEventConfirm: "Bu tadbirni o'chirish?",
    neAddNews: "Yangilik qo'shish", neMuseum: "Muzey", neSelectMuseum: "— Muzeyni tanlang —",
    neHeadlineLabel: "Sarlavha *", neHeadlinePlaceholder: "Yangilik sarlavhasi",
    neContentLabel: "Yangilik matni", neContentPlaceholder: "Batafsil…", nePhotoLabel: "Rasm",
    neUploaded: "✓ Yuklandi", neSelectMuseumAlert: "Muzeyni tanlang", neTitleAlert: "Sarlavha kiriting",
    neSaveError: "Saqlashda xatolik", nePublish: "Yangilikni e'lon qilish",
    neAddEvent: "Tadbir qo'shish", neEventNameLabel: "Nomi *", neEventNamePlaceholder: "Tadbir nomi",
    neEventDateLabel: "Sana *", neEventTimeLabel: "Vaqt", neEventDescLabel: "Tavsif",
    neEventDescPlaceholder: "Tadbir tavsifi…", neEventDateAlert: "Nomi va sanani kiriting", neEventAdd: "Afishaga qo'shish",
    months: ["yan","fev","mar","apr","may","iyn","iyl","avg","sen","okt","noy","dek"],
    adminsTitle: "Admin foydalanuvchi hisoblari", adminsSuperLabel: "Superadmin — asosiy hisobingiz",
    adminsLoginLabel: "Login:", adminsPassLabel: "Parol:",
    adminsSuperNote: "Bu hisobni o'chirib bo'lmaydi. Parolni SSH orqali o'zgartiring.",
    adminsActiveTitle: "Faol hisoblar", adminsRole: (r) => `Rol: ${r}`,
    adminsMuseums: (m) => `Muzeylar: ${m.length > 0 ? m.join(", ") : "Tayinlanmagan"}`,
    adminsResetPwd: "Parolni tiklash", adminsDeleteConfirm: (u) => `"${u}" hisobini o'chirishni tasdiqlaysizmi?`,
    adminsDeleteError: "O'chirib bo'lmadi", adminsDelete: "O'chirish",
    adminsNewPwd: (u) => `${u} uchun yangi parol`, adminsNewPwdPlaceholder: "Yangi parol kiriting",
    adminsHide: "Yashirish", adminsShow: "Ko'rsatish", adminsPwdRequired: "Parol kiriting",
    adminsPwdUpdated: (u) => `"${u}" paroli yangilandi`, adminsPwdError: "Parolni tiklashda xatolik",
    adminsSave: "Saqlash", adminsNone: "Boshqa hisoblar yo'q.",
    adminsGenerateTitle: "Admin Login Yaratish", adminsUsernameLabel: "Foydalanuvchi nomi",
    adminsPasswordLabel: "Parol", adminsAssignMuseums: "Muzeylarni tayinlash", adminsGenerate: "Admin yaratish",
    adminsCreateSuccess: "Admin Login muvaffaqiyatli yaratildi!", adminsCreateError: "Admin yaratishda xatolik",
    expoTitle: "Ekspozitsiya", expoSub: "Muzeylar ekspozitsiyasi fotosuratlarini boshqaring.",
    expoSelectMuseum: "Muzeyni tanlang", expoSelectOption: "— muzeyni tanlang —", expoLoading: "Yuklanmoqda…",
    expoNone: "Ekspozitsiya fotolari yo'q", expoHall: (n) => `Zal ${n}`,
    expoTitlePlaceholder: "Nomi", expoDescPlaceholder: "Tavsif", expoSaveError: "Saqlashda xatolik",
    expoSaveBtn: "Saqlash", expoDeletePhotoConfirm: "Fotosuratni o'chirish?", expoDeleteError: "O'chirishda xatolik",
    expoEditBtn: "Tahrirlash", expoAddFormTitle: "Foto qo'shish", expoPhotoLabel: "Fotosurat",
    expoOptNameLabel: "Nomi (ixtiyoriy)", expoOptNamePlaceholder: "Eksponat nomi",
    expoOptDescLabel: "Tavsif (ixtiyoriy)", expoOptDescPlaceholder: "Eksponat tavsifi...",
    expoPhotoRequired: "Avval fotosurat yuklang", expoAddError: "Foto qo'shishda xatolik", expoAddBtn: "Ekspozitsiyaga qo'shish",
  },
  ru: {
    backToSite: "← На сайт", signOut: "Выйти",
    tabNews: "Новости & Афиша", tabExposition: "Экспозиция", tabAdmins: "Аккаунты",
    dashTitle: "Обзор", dashSub: "Добро пожаловать! Сводка за сегодня.", dashDownload: "Скачать отчёт",
    dashVisits: "Всего посещений", dashToday: "Сегодня", dashAvgQuiz: "Средний балл теста",
    dashWeekChart: "Посещения за 7 дней", dashActivity: "Последняя активность", dashViewAll: "Вся активность →",
    dashQuizByMuseum: "Результаты тестов по музеям",
    musTitle: "База музеев", musSub: (n) => `Управляйте ${n} объектами Ферганской долины.`,
    musAdd: "+ Добавить музей", musNewHeading: "Новый музей", musEditHeading: (id) => `Редактировать: ${id}`,
    musFieldId: "ID (строчные латинские без пробелов)", musFieldCity: "Город", musFieldPhone: "Телефон",
    musFieldEstablished: "Год основания", musFieldBirth: "Год рождения автора", musFieldDeath: "Год смерти автора",
    musFieldGps: "GPS координаты — кликните на карту чтобы установить метку", musFieldHero: "Фото здания (главное изображение)",
    musTranslations: "Переводы", musFieldName: "Название музея", musFieldOwner: "Имя поэта / владельца",
    musFieldRole: "Должность / роль", musFieldLifespan: "Годы жизни (lifespan)", musFieldAddress: "Адрес",
    musFieldFounded: "Дата основания", musFieldHours: "График работы", musFieldEntry: "Цена входа",
    musFieldBio: "Биография", musPlaceholderHours: "Пн–Сб, 9:00–18:00", musPlaceholderEntry: "Взрослые: 15 000 сум · Дети: 5 000 сум",
    musSave: "Сохранить", musCancel: "Отмена",
    tblMuseum: "Музей", tblCity: "Город", tblStatus: "Статус", tblActions: "Действия", tblActive: "Активен", tblEdit: "Изменить", tblDelete: "Удалить",
    expTitle: "Экспозиция (экспонаты)", expNoExhibits: (l) => `Экспонаты для ${l.toUpperCase()} не добавлены.`,
    expExhibitTitle: "Название экспоната", expDescription: "Описание", expImage: "Фото экспоната",
    chronoTitle: "Хронология жизни", chronoSub: "Биографические события личности музея (год и текст). Отображаются на странице музея и на общей /timeline.",
    chronoNone: (l) => `Записи для ${l.toUpperCase()} не добавлены.`,
    chronoYearLabel: "Год", chronoTextLabel: "Текст события",
    chronoAdd: "Добавить событие", chronoAddTitle: (l) => `Новая запись (${l.toUpperCase()})`,
    chronoSave: "Сохранить", chronoCancel: "Отмена", chronoDelete: "Удалить",
    chronoDeleteConfirm: "Удалить эту запись?", chronoYearPlaceholder: "Например: 1856",
    chronoTextPlaceholder: "Описание события…", chronoYearRequired: "Введите год",
    chronoTextRequired: "Введите текст события",
    expSave: "Сохранить", expCancel: "Отмена", expEdit: "Изменить", expDelete: "Удалить",
    expDeleteConfirm: "Удалить этот экспонат?", expAddTitle: (l) => `Добавить экспонат (${l.toUpperCase()})`,
    expAddExhibit: "Добавить",
    newsTitle: (l) => `Новости (${l.toUpperCase()})`, newsNone: "Новостей пока нет.", newsAddTitle: "Добавить новость",
    newsFieldTitle: "Заголовок", newsFieldImage: "Фото новости", newsFieldContent: "Текст",
    newsDeleteConfirm: "Удалить эту новость?", newsDelete: "Удалить", newsPost: "Опубликовать",
    eventsTitle: (l) => `Предстоящие события (${l.toUpperCase()})`, eventsNone: "Событий пока нет.", eventsDateLabel: "Дата:",
    eventsDeleteConfirm: "Удалить это событие?", eventsDelete: "Удалить",
    eventsAddTitle: "Добавить событие", eventsFieldTitle: "Название", eventsFieldDate: "Дата",
    eventsFieldImage: "Фото события", eventsFieldDesc: "Описание", eventsSchedule: "Добавить в афишу",
    quizActiveTitle: "Активные вопросы теста", quizNone: "Вопросы не добавлены.", quizDelete: "Удалить",
    quizAddTitle: "Добавить вопрос", quizSelectMuseum: "Выберите музей",
    quizQuestion: (l) => `Текст вопроса (${l.toUpperCase()})`, quizOptions: (l) => `Варианты ответов (${l.toUpperCase()})`,
    quizCorrect: "Индекс правильного ответа", quizAddBtn: "Добавить вопрос",
    settingsTitle: "Настройки переводов сайта", settingsSub: "Управляйте статическими переводами интерфейса.",
    settingsSave: "Сохранить все переводы", settingsSearch: "Поиск по ключам или тексту перевода...",
    settingsNotFound: "Совпадений не найдено.", settingsUiKey: "Ключ перевода UI",
    neTitle: "Новости & Афиша", neSub: "Управляйте публикациями и событиями всех музеев.",
    neSubNews: "Новости", neSubEvents: "Афиша событий", neLoading: "Загрузка…",
    neNewsNone: "Новостей пока нет", neAllMuseums: "Все музеи",
    neDeleteNewsConfirm: "Удалить эту новость?", neDeleteError: "Не удалось удалить", neDeleteBtn: "Удалить",
    neEventsNone: "Событий пока нет", neDeleteEventConfirm: "Удалить это событие?",
    neAddNews: "Добавить новость", neMuseum: "Музей", neSelectMuseum: "— Выберите музей —",
    neHeadlineLabel: "Заголовок *", neHeadlinePlaceholder: "Заголовок новости",
    neContentLabel: "Текст новости", neContentPlaceholder: "Подробности…", nePhotoLabel: "Фото",
    neUploaded: "✓ Загружено", neSelectMuseumAlert: "Выберите музей", neTitleAlert: "Введите заголовок",
    neSaveError: "Ошибка при сохранении", nePublish: "Опубликовать новость",
    neAddEvent: "Добавить событие", neEventNameLabel: "Название *", neEventNamePlaceholder: "Название события",
    neEventDateLabel: "Дата *", neEventTimeLabel: "Время", neEventDescLabel: "Описание",
    neEventDescPlaceholder: "Описание события…", neEventDateAlert: "Введите название и дату", neEventAdd: "Добавить в афишу",
    months: ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
    adminsTitle: "Управление аккаунтами", adminsSuperLabel: "Суперадмин — ваш главный аккаунт",
    adminsLoginLabel: "Логин:", adminsPassLabel: "Пароль:",
    adminsSuperNote: "Этот аккаунт нельзя удалить. Смените пароль через SSH если нужно.",
    adminsActiveTitle: "Активные аккаунты", adminsRole: (r) => `Роль: ${r}`,
    adminsMuseums: (m) => `Музеи: ${m.length > 0 ? m.join(", ") : "Не назначены"}`,
    adminsResetPwd: "Сбросить пароль", adminsDeleteConfirm: (u) => `Удалить аккаунт "${u}"?`,
    adminsDeleteError: "Не удалось удалить", adminsDelete: "Удалить",
    adminsNewPwd: (u) => `Новый пароль для ${u}`, adminsNewPwdPlaceholder: "Введите новый пароль",
    adminsHide: "Скрыть", adminsShow: "Показать", adminsPwdRequired: "Введите пароль",
    adminsPwdUpdated: (u) => `Пароль для "${u}" обновлён`, adminsPwdError: "Ошибка сброса пароля",
    adminsSave: "Сохранить", adminsNone: "Других аккаунтов пока нет.",
    adminsGenerateTitle: "Создать Admin Login", adminsUsernameLabel: "Имя пользователя",
    adminsPasswordLabel: "Пароль", adminsAssignMuseums: "Назначить музеи", adminsGenerate: "Создать аккаунт",
    adminsCreateSuccess: "Admin аккаунт успешно создан!", adminsCreateError: "Не удалось создать аккаунт",
    expoTitle: "Экспозиция", expoSub: "Управляйте фотографиями и описаниями экспозиций музеев.",
    expoSelectMuseum: "Выберите музей", expoSelectOption: "— выберите музей —", expoLoading: "Загрузка…",
    expoNone: "Фотографий экспозиции пока нет", expoHall: (n) => `Зал ${n}`,
    expoTitlePlaceholder: "Название", expoDescPlaceholder: "Описание", expoSaveError: "Ошибка сохранения",
    expoSaveBtn: "Сохранить", expoDeletePhotoConfirm: "Удалить фото?", expoDeleteError: "Ошибка удаления",
    expoEditBtn: "Изменить", expoAddFormTitle: "Добавить фото", expoPhotoLabel: "Фотография",
    expoOptNameLabel: "Название (необязательно)", expoOptNamePlaceholder: "Название экспоната",
    expoOptDescLabel: "Описание (необязательно)", expoOptDescPlaceholder: "Описание экспоната...",
    expoPhotoRequired: "Сначала загрузите фотографию", expoAddError: "Ошибка добавления фото", expoAddBtn: "Добавить в экспозицию",
  },
  en: {
    backToSite: "← Back to Site", signOut: "Sign Out",
    tabNews: "News & Events", tabExposition: "Exposition", tabAdmins: "Admin Accounts",
    dashTitle: "Dashboard Overview", dashSub: "Welcome back! Here's what's happening today.", dashDownload: "Download Report",
    dashVisits: "Total Visits", dashToday: "Today", dashAvgQuiz: "Avg. Quiz Score",
    dashWeekChart: "Visits (7 days)", dashActivity: "Recent Activity", dashViewAll: "View All Activity →",
    dashQuizByMuseum: "Quiz Completions by Museum",
    musTitle: "Museums Database", musSub: (n) => `Manage ${n} locations across the Fergana Valley.`,
    musAdd: "+ Add New Museum", musNewHeading: "New Museum", musEditHeading: (id) => `Edit: ${id}`,
    musFieldId: "ID (lowercase latin, no spaces)", musFieldCity: "City", musFieldPhone: "Phone",
    musFieldEstablished: "Year established", musFieldBirth: "Author birth year", musFieldDeath: "Author death year",
    musFieldGps: "GPS coordinates — click on map to set marker", musFieldHero: "Building photo (hero image)",
    musTranslations: "Translations", musFieldName: "Museum name", musFieldOwner: "Poet / owner name",
    musFieldRole: "Position / role", musFieldLifespan: "Lifespan", musFieldAddress: "Address",
    musFieldFounded: "Founded date", musFieldHours: "Working hours", musFieldEntry: "Entry price",
    musFieldBio: "Biography", musPlaceholderHours: "Mon–Sat, 9:00–18:00", musPlaceholderEntry: "Adults: 15,000 UZS · Children: 5,000 UZS",
    musSave: "Save", musCancel: "Cancel",
    tblMuseum: "Museum", tblCity: "City", tblStatus: "Status", tblActions: "Actions", tblActive: "Active", tblEdit: "Edit", tblDelete: "Delete",
    expTitle: "Museum Exposition (Exhibits)", expNoExhibits: (l) => `No exhibits added for ${l.toUpperCase()} translation.`,
    expExhibitTitle: "Exhibit Title", expDescription: "Description", expImage: "Exhibit Image",
    chronoTitle: "Life chronology", chronoSub: "Biographical events of the museum's person (year and text). Shown on the museum page and on the shared /timeline.",
    chronoNone: (l) => `No entries added for ${l.toUpperCase()}.`,
    chronoYearLabel: "Year", chronoTextLabel: "Event text",
    chronoAdd: "Add event", chronoAddTitle: (l) => `New entry (${l.toUpperCase()})`,
    chronoSave: "Save", chronoCancel: "Cancel", chronoDelete: "Delete",
    chronoDeleteConfirm: "Delete this entry?", chronoYearPlaceholder: "e.g. 1856",
    chronoTextPlaceholder: "Event description…", chronoYearRequired: "Enter a year",
    chronoTextRequired: "Enter event text",
    expSave: "Save", expCancel: "Cancel", expEdit: "Edit", expDelete: "Delete",
    expDeleteConfirm: "Delete this exhibit?", expAddTitle: (l) => `Add Exhibit Object (${l.toUpperCase()})`,
    expAddExhibit: "Add Exhibit",
    newsTitle: (l) => `News Updates (${l.toUpperCase()})`, newsNone: "No news posted yet.", newsAddTitle: "Post News Article",
    newsFieldTitle: "Title", newsFieldImage: "News Image", newsFieldContent: "Content",
    newsDeleteConfirm: "Delete this news article?", newsDelete: "Delete", newsPost: "Post News",
    eventsTitle: (l) => `Upcoming Events (${l.toUpperCase()})`, eventsNone: "No events scheduled yet.", eventsDateLabel: "Date:",
    eventsDeleteConfirm: "Delete this event?", eventsDelete: "Delete",
    eventsAddTitle: "Schedule Event", eventsFieldTitle: "Title", eventsFieldDate: "Event Date",
    eventsFieldImage: "Event Image", eventsFieldDesc: "Description", eventsSchedule: "Schedule Event",
    quizActiveTitle: "Active Quiz Questions", quizNone: "No quiz questions configured yet.", quizDelete: "Delete",
    quizAddTitle: "Add Quiz Question", quizSelectMuseum: "Select Museum",
    quizQuestion: (l) => `Question Text (${l.toUpperCase()})`, quizOptions: (l) => `Options (${l.toUpperCase()})`,
    quizCorrect: "Correct Option Index", quizAddBtn: "Add Question",
    settingsTitle: "Site Translations Settings", settingsSub: "Manage static localization words of the main website interface.",
    settingsSave: "{a.settingsSave}", settingsSearch: "Search localization keys or translation text...",
    settingsNotFound: "No matching translation words found.", settingsUiKey: "UI Translation Key",
    neTitle: "News & Events", neSub: "Manage publications and events for all museums.",
    neSubNews: "News", neSubEvents: "Events", neLoading: "Loading…",
    neNewsNone: "No news yet", neAllMuseums: "All museums",
    neDeleteNewsConfirm: "Delete this news article?", neDeleteError: "Failed to delete", neDeleteBtn: "Delete",
    neEventsNone: "No events yet", neDeleteEventConfirm: "Delete this event?",
    neAddNews: "Add News", neMuseum: "Museum", neSelectMuseum: "— Select museum —",
    neHeadlineLabel: "Headline *", neHeadlinePlaceholder: "News headline",
    neContentLabel: "News text", neContentPlaceholder: "Details…", nePhotoLabel: "Photo",
    neUploaded: "✓ Uploaded", neSelectMuseumAlert: "Select a museum", neTitleAlert: "Enter a headline",
    neSaveError: "Error saving", nePublish: "Publish news",
    neAddEvent: "Add Event", neEventNameLabel: "Name *", neEventNamePlaceholder: "Event name",
    neEventDateLabel: "Date *", neEventTimeLabel: "Time", neEventDescLabel: "Description",
    neEventDescPlaceholder: "Event description…", neEventDateAlert: "Enter name and date", neEventAdd: "Add to events",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    adminsTitle: "Admin User Accounts", adminsSuperLabel: "Superadmin — your main account",
    adminsLoginLabel: "Login:", adminsPassLabel: "Password:",
    adminsSuperNote: "This account cannot be deleted. Change the password via SSH if needed.",
    adminsActiveTitle: "Active accounts", adminsRole: (r) => `Role: ${r}`,
    adminsMuseums: (m) => `Museums: ${m.length > 0 ? m.join(", ") : "None assigned"}`,
    adminsResetPwd: "Reset password", adminsDeleteConfirm: (u) => `Delete account "${u}"?`,
    adminsDeleteError: "Failed to delete", adminsDelete: "Delete",
    adminsNewPwd: (u) => `New password for ${u}`, adminsNewPwdPlaceholder: "Enter new password",
    adminsHide: "Hide", adminsShow: "Show", adminsPwdRequired: "Enter a password",
    adminsPwdUpdated: (u) => `Password for "${u}" updated`, adminsPwdError: "Error resetting password",
    adminsSave: "Save", adminsNone: "No other accounts yet.",
    adminsGenerateTitle: "Generate Admin Login", adminsUsernameLabel: "Username",
    adminsPasswordLabel: "Password", adminsAssignMuseums: "Assign Managed Museums", adminsGenerate: "Generate Admin",
    adminsCreateSuccess: "Admin login generated successfully!", adminsCreateError: "Failed to create admin",
    expoTitle: "Exposition", expoSub: "Manage exposition photos and descriptions for museums.",
    expoSelectMuseum: "Select museum", expoSelectOption: "— select museum —", expoLoading: "Loading…",
    expoNone: "No exposition photos yet", expoHall: (n) => `Hall ${n}`,
    expoTitlePlaceholder: "Title", expoDescPlaceholder: "Description", expoSaveError: "Error saving",
    expoSaveBtn: "Save", expoDeletePhotoConfirm: "Delete photo?", expoDeleteError: "Error deleting",
    expoEditBtn: "Edit", expoAddFormTitle: "Add photo", expoPhotoLabel: "Photo",
    expoOptNameLabel: "Title (optional)", expoOptNamePlaceholder: "Exhibit title",
    expoOptDescLabel: "Description (optional)", expoOptDescPlaceholder: "Exhibit description...",
    expoPhotoRequired: "Upload a photo first", expoAddError: "Error adding photo", expoAddBtn: "Add to exposition",
  }
};

export default function AdminPage() {
  const { museums, loading } = useMuseums();
  const { lang, t, refreshTranslations } = useLang();
  const a = aL[lang] || aL.ru;
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editId, setEditId] = useState(null);
  const [formLang, setFormLang] = useState(lang);
  const [uploadedHeroImages, setUploadedHeroImages] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [editingExhibitId, setEditingExhibitId] = useState(null);
  const [editingExhibitTitle, setEditingExhibitTitle] = useState('');
  const [editingExhibitDesc, setEditingExhibitDesc] = useState('');
  const [editingExhibitImage, setEditingExhibitImage] = useState('');
  // Life chronology (biography events)
  const [chronoList, setChronoList] = useState([]);
  const [editingChronoId, setEditingChronoId] = useState(null);
  const [editingChronoYear, setEditingChronoYear] = useState('');
  const [editingChronoText, setEditingChronoText] = useState('');
  const [newChronoYear, setNewChronoYear] = useState('');
  const [newChronoText, setNewChronoText] = useState('');
  const [siteTranslations, setSiteTranslations] = useState([]);
  const [translationsSearchQuery, setTranslationsSearchQuery] = useState('');

  // News and events management state
  const [newsList, setNewsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [newNewsImage, setNewNewsImage] = useState('');
  const [newEventImage, setNewEventImage] = useState('');

  // Admin user management state
  const [adminsList, setAdminsList] = useState([]);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // News & Events dedicated tab state
  const [neSubTab, setNeSubTab] = useState('news');
  const [neLang, setNeLang] = useState('ru');
  const [neMuseumId, setNeMuseumId] = useState('');
  const [allNewsGlobal, setAllNewsGlobal] = useState([]);
  const [allEventsGlobal, setAllEventsGlobal] = useState([]);
  const [neLoading, setNeLoading] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image: '' });
  const [eventsForm, setEventsForm] = useState({ title: '', description: '', date: '', time: '' });

  // Exposition tab state
  const [newExhibitImg, setNewExhibitImg] = useState('');
  const [exhibitsList, setExhibitsList] = useState([]);
  const [expoMuseumId, setExpoMuseumId] = useState('');
  const [expoLang, setExpoLang] = useState('ru');
  const [expoExhibits, setExpoExhibits] = useState([]);
  const [expoLoading, setExpoLoading] = useState(false);
  const [expoEditId, setExpoEditId] = useState(null);
  const [expoEditTitle, setExpoEditTitle] = useState('');
  const [expoEditDesc, setExpoEditDesc] = useState('');
  const [expoAddImg, setExpoAddImg] = useState('');

  // Visit stats for dashboard
  const [visitStats, setVisitStats] = useState(null);

  // Multi-lang edit form state
  const [allLangData, setAllLangData] = useState({ uz: {}, ru: {}, en: {} });
  const [editCoords, setEditCoords] = useState(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/museums/quiz-stats/all`);
        if (res.ok) {
          const data = await res.json();
          setQuizStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz stats', err);
      }
    };
    const fetchTranslations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-translations`);
        if (res.ok) {
          const data = await res.json();
          setSiteTranslations(data);
        }
      } catch (err) {
        console.error('Failed to fetch site translations', err);
      }
    };
    const fetchVisits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/museums/visits/stats`);
        if (res.ok) setVisitStats(await res.json());
      } catch (err) { /* ignore */ }
    };
    fetchStats();
    fetchTranslations();
    fetchVisits();
  }, []);

  // Load all 3 language data when opening museum editor
  useEffect(() => {
    if (!editId || editId === 'new') {
      setAllLangData({ uz: {}, ru: {}, en: {} });
      setEditCoords(null);
      return;
    }
    Promise.all(['uz', 'ru', 'en'].map(l =>
      fetch(`${API_URL}/api/museums/${editId}?lang=${l}`).then(r => r.ok ? r.json() : null)
    )).then(([uzRes, ruRes, enRes]) => {
      setEditCoords(uzRes?.coords || null);
      setAllLangData({
        uz: uzRes?.uz || {},
        ru: ruRes?.ru || {},
        en: enRes?.en || {}
      });
      setFormKey(k => k + 1);
    }).catch(() => {});
  }, [editId]);

  // Fetch admin list (super admin only)
  useEffect(() => {
    if (user?.role === 'super_admin' && token) {
      const fetchAdmins = async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/admins`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAdminsList(data);
          }
        } catch (err) {
          console.error('Failed to fetch admins', err);
        }
      };
      fetchAdmins();
    }
  }, [user, token, activeTab]);

  const fetchAllNewsEvents = async () => {
    setNeLoading(true);
    try {
      const [rNews, rEvents] = await Promise.all([
        fetch(`${API_URL}/api/museums/all-news?lang=${neLang}`),
        fetch(`${API_URL}/api/museums/all-events?lang=${neLang}`)
      ]);
      if (rNews.ok) setAllNewsGlobal(await rNews.json());
      if (rEvents.ok) setAllEventsGlobal(await rEvents.json());
    } catch (e) { console.error(e); }
    setNeLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'news_events') fetchAllNewsEvents();
  }, [activeTab, neLang]);

  // Fetch exhibits + life chronology when museum editor opens
  useEffect(() => {
    if (!editId || editId === 'new') {
      setExhibitsList([]);
      setChronoList([]);
      return;
    }
    fetch(`${API_URL}/api/museums/${editId}?lang=${formLang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const loc = data[formLang] || data.uz || {};
        setExhibitsList(loc.exhibits || []);
        setChronoList(loc.events || []);
      })
      .catch(() => {});
  }, [editId, formLang]);

  // Fetch exposition exhibits for the dedicated exposition tab
  useEffect(() => {
    if (!expoMuseumId) { setExpoExhibits([]); return; }
    setExpoLoading(true);
    fetch(`${API_URL}/api/museums/${expoMuseumId}?lang=${expoLang}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setExpoExhibits(data ? (data[expoLang] || data.uz || {}).exhibits || [] : []); })
      .catch(() => { setExpoExhibits([]); })
      .finally(() => setExpoLoading(false));
  }, [expoMuseumId, expoLang]);

  // Fetch news & events when editing a museum
  useEffect(() => {
    if (editId && editId !== 'new') {
      const fetchNewsAndEvents = async () => {
        try {
          const resNews = await fetch(`${API_URL}/api/museums/${editId}/news?lang=${formLang}`);
          const resEv = await fetch(`${API_URL}/api/museums/${editId}/events?lang=${formLang}`);
          if (resNews.ok) setNewsList(await resNews.json());
          if (resEv.ok) setEventsList(await resEv.json());
        } catch (e) {
          console.error(e);
        }
      };
      fetchNewsAndEvents();
    } else {
      setNewsList([]);
      setEventsList([]);
    }
    setNewNewsImage('');
    setNewEventImage('');
  }, [editId, formLang]);

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        callback(data.url);
      } else {
        alert('Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const isNew = editId === 'new';
      // For new museums use ?lang=uz; for existing the backend detects multi-lang from name_uz field
      const url = isNew
        ? `${API_URL}/api/museums?lang=uz`
        : `${API_URL}/api/museums/${editId}`;

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to save museum data');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving museum data');
    }
  };

  if (loading) return <div style={{padding:48, textAlign:'center', color:'var(--muted)'}}>Loading museums...</div>;

  // Filter museums based on user assignment
  const allowedMuseums = user?.role === 'museum_admin'
    ? museums.filter(m => user.assignedMuseums.includes(m.id))
    : museums;

  const mCount = allowedMuseums.length;
  const qCount = allowedMuseums.reduce((acc, m) => acc + (m[lang]?.quiz?.length || 0), 0);

  // Filter quiz stats based on user assignment
  const filteredQuizStats = user?.role === 'museum_admin'
    ? quizStats.filter(s => user.assignedMuseums.includes(s.museum_id))
    : quizStats;

  const totalQuestions = filteredQuizStats.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = filteredQuizStats.reduce((sum, s) => sum + s.score, 0);
  const avgScoreStr = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) + '%' : '82%';

  const recentQuizCompletions = filteredQuizStats.slice(0, 5).map(s => {
    const mus = allowedMuseums.find(m => m.id === s.museum_id) || {};
    const musName = (mus[lang] || mus.uz || {}).name || s.museum_id;
    return {
      id: s.id,
      user: s.username,
      action: 'completed quiz for',
      target: musName,
      score: `${s.score}/${s.total}`,
      time: new Date(s.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  const completionsByMuseum = allowedMuseums.map(m => {
    const count = filteredQuizStats.filter(s => s.museum_id === m.id).length;
    return {
      name: (m[lang] || m.uz || {}).name?.split(' ')[0] || m.id,
      completions: count
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(8px)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: 'var(--radius)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--fg)', fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
            {payload[0].value} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>{payload[0].name}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Build the sidebar tabs dynamically depending on user role
  const tabs = [
    { id: 'dashboard', label: t.adminStats || 'Dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
    { id: 'museums', label: t.adminMuseums || 'Museums', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'quizzes', label: t.adminQuizzes || 'Quizzes', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
    { id: 'news_events', label: a.tabNews, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z M17 20v-8H7v8 M7 4v4h8' },
    { id: 'exposition', label: a.tabExposition, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  if (user?.role === 'super_admin') {
    tabs.push({ id: 'settings', label: t.adminSettings || 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' });
    tabs.push({ id: 'admins', label: a.tabAdmins, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 110-8 4 4 0 010 8zm8-4a4 4 0 110 8 4 4 0 010-8z' });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, borderRight: '1px solid var(--line)', background: 'var(--surface2)', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 32px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>A</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '.05em', color: 'var(--fg)' }}>Farg'ona Admin</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', gap: 4 }}>
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => { setActiveTab(tb.id); setEditId(null); }} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              textAlign: 'left', background: activeTab === tb.id ? 'var(--surface)' : 'transparent',
              border: '1px solid', borderColor: activeTab === tb.id ? 'var(--line)' : 'transparent',
              borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontSize: 14.5, fontFamily: 'var(--font-ui)',
              color: activeTab === tb.id ? 'var(--fg)' : 'var(--muted)', fontWeight: activeTab === tb.id ? 600 : 400,
              transition: 'all .2s'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: activeTab === tb.id ? 1 : 0.6, color: activeTab === tb.id ? 'var(--accent)' : 'inherit' }}>
                <path d={tb.icon} />
              </svg>
              {tb.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', width: '100%', padding: '10px', borderRadius: 99, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
            {a.backToSite}
          </button>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', width: '100%', padding: '10px', borderRadius: 99, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
            {a.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 56px', maxWidth: 1200, margin: '0 auto', overflowY: 'auto' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fhFade .4s ease both' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 8px', color: 'var(--fg)' }}>{a.dashTitle}</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{a.dashSub}</p>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>{a.dashDownload}</button>
            </header>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
              {[
                { label: a.dashVisits, value: visitStats ? visitStats.total.toLocaleString() : '—', color: 'var(--accent)' },
                { label: a.dashToday, value: visitStats ? String(visitStats.today) : '—', color: 'var(--fg)' },
                { label: a.dashAvgQuiz, value: avgScoreStr, color: '#2E7D32' }
              ].map((m, i) => (
                <div key={i} style={{ padding: 28, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: m.color }} />
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 44, color: 'var(--fg)', fontWeight: 800, lineHeight: 1 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 40 }}>
              
              {/* Line Chart */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>{a.dashWeekChart}</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(visitStats?.days7 || []).map(d => ({ name: new Date(d.date + 'T12:00:00').toLocaleDateString('ru', { day: 'numeric', month: 'short' }), visits: d.visits }))} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--line)', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="visits" name="Visits" stroke="var(--accent)" strokeWidth={4} dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>{a.dashActivity}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
                  {recentQuizCompletions.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--fg)', flexShrink: 0, border: '1px solid var(--line)' }}>
                        {act.user.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600 }}>{act.user}</span> {act.action} <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{act.target}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{act.time}</div>
                          {act.score && <div style={{ fontSize: 11, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Score: {act.score}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16, textAlign: 'left', padding: 0 }}>{a.dashViewAll}</button>
              </div>
            </div>

            {/* Bottom Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
               <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 24px', color: 'var(--fg)' }}>{a.dashQuizByMuseum}</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionsByMuseum} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)', opacity: 0.5 }} />
                      <Bar dataKey="completions" name="Completions" radius={[6, 6, 0, 0]}>
                        {completionsByMuseum.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 50%, var(--bg))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MUSEUMS TAB */}
        {activeTab === 'museums' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 8px', color: 'var(--fg)' }}>{a.musTitle}</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{a.musSub(mCount)}</p>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => { setEditId('new'); setFormLang(lang); setUploadedHeroImages([]); }}>{a.musAdd}</button>
            </header>
            
            {editId ? (() => {
              const isNew = editId === 'new';
              const museumObj = museums.find(m => m.id === editId) || {};
              const mData = isNew ? {} : (museumObj[formLang] || museumObj.uz || museumObj.ru || museumObj.en || {});
              const mInfo = mData.info || {};
              return (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 40, animation: 'fhRise .3s ease' }}>
                <h3 style={{ margin: '0 0 28px', fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--fg)' }}>
                  {isNew ? a.musNewHeading : a.musEditHeading(editId)}
                </h3>

                <form key={formKey} onSubmit={handleSave}>
                  {/* Shared fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    {isNew && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldId}</label>
                        <input name="id" type="text" placeholder="al_farghani" required style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldCity}</label>
                      <select name="city" defaultValue={museumObj.city || 'kokand'} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }}>
                        <option value="kokand">Qo'qon / Коканд</option>
                        <option value="margilan">Marg'ilon / Маргилан</option>
                        <option value="fergana">Farg'ona / Фергана</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldPhone}</label>
                      <input name="phone" type="text" defaultValue={(allLangData.uz?.info || allLangData.ru?.info || {}).phone || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldEstablished}</label>
                      <input name="established" type="number" defaultValue={museumObj.established || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldBirth}</label>
                      <input name="birth" type="number" defaultValue={museumObj.birth || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldDeath}</label>
                      <input name="death" type="number" defaultValue={museumObj.death || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                  </div>

                  {/* GPS Map Picker */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>
                      {a.musFieldGps}
                      {editCoords && <span style={{ marginLeft: 12, color: 'var(--accent)', fontWeight: 600 }}>{editCoords[0].toFixed(5)}, {editCoords[1].toFixed(5)}</span>}
                    </label>
                    <div style={{ height: 280, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <MapContainer center={editCoords || [40.45, 71.0]} zoom={editCoords ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
                        <MapClickHandler onClickCoords={setEditCoords} />
                        {editCoords && <MapRecenter center={editCoords} />}
                        {editCoords && <Marker position={editCoords} icon={_markerIcon} />}
                      </MapContainer>
                    </div>
                    <input type="hidden" name="lat" value={editCoords?.[0] ?? ''} />
                    <input type="hidden" name="lon" value={editCoords?.[1] ?? ''} />
                  </div>

                  {/* Hero Images */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.musFieldHero}</label>
                    {uploadedHeroImages.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                        {uploadedHeroImages.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: 100, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                            <img src={`${API_URL}${img}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setUploadedHeroImages(prev => prev.filter((_, i) => i !== idx))}
                              style={{ position: 'absolute', top: 4, right: 4, background: '#D32F2F', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const r = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd });
                        if (r.ok) { const d = await r.json(); setUploadedHeroImages(prev => [...prev, d.url]); }
                      } catch (err) { console.error(err); }
                    }} style={{ fontSize: 13 }} />
                    <input type="hidden" name="heroImage" value={JSON.stringify(uploadedHeroImages)} />
                  </div>

                  {/* 3-Language Sections */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 28, marginBottom: 28 }}>
                    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 18, margin: '0 0 20px', color: 'var(--fg)' }}>{a.musTranslations}</h4>
                    {(isNew ? ['uz'] : ['uz', 'ru', 'en']).map(l => {
                      const ld = allLangData[l] || {};
                      const li = ld.info || {};
                      const labels = { uz: 'Ўзбекча', ru: 'Русский', en: 'English' };
                      return (
                        <div key={l} style={{ marginBottom: 28, background: 'var(--surface2)', borderRadius: 10, padding: 20, border: '1px solid var(--line)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--accent)', marginBottom: 16 }}>{labels[l]}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldName}</label>
                              <input name={isNew ? 'name' : `name_${l}`} type="text" defaultValue={ld.name || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldOwner}</label>
                              <input name={isNew ? 'owner' : `owner_${l}`} type="text" defaultValue={ld.owner || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldRole}</label>
                              <input name={isNew ? 'role' : `role_${l}`} type="text" defaultValue={ld.role || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldLifespan}</label>
                              <input name={isNew ? 'lifespan' : `lifespan_${l}`} type="text" defaultValue={ld.lifespan || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldAddress}</label>
                              <input name={isNew ? 'address' : `address_${l}`} type="text" defaultValue={li.address || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldFounded}</label>
                              <input name={isNew ? 'founded' : `founded_${l}`} type="text" defaultValue={li.founded || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--surface))', borderRadius: 8, padding: '12px 14px', border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--line))' }}>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)', marginBottom: 5, fontWeight: 700 }}>{a.musFieldHours}</label>
                              <input name={isNew ? 'hours' : `hours_${l}`} type="text" defaultValue={li.hours || ''} placeholder={a.musPlaceholderHours} style={{ width: '100%', padding: '8px 0', border: 'none', background: 'transparent', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--surface))', borderRadius: 8, padding: '12px 14px', border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--line))' }}>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)', marginBottom: 5, fontWeight: 700 }}>{a.musFieldEntry}</label>
                              <input name={isNew ? 'entry' : `entry_${l}`} type="text" defaultValue={li.entry || ''} placeholder={a.musPlaceholderEntry} style={{ width: '100%', padding: '8px 0', border: 'none', background: 'transparent', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>{a.musFieldBio}</label>
                              <textarea name={isNew ? 'bio' : `bio_${l}`} defaultValue={ld.bio || ''} rows={5} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button type="submit" className="btn-primary">{a.musSave}</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>{a.musCancel}</button>
                  </div>
                </form>

                {/* Exposition exhibits list and creation block */}
                {!isNew && (
                  <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 40 }}>
                    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 16px', color: 'var(--fg)' }}>{a.expTitle}</h4>
                    
                    {/* List of current exhibits */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                      {(exhibitsList).length === 0 ? (
                        <div style={{ color: 'var(--muted)', fontSize: 14, fontStyle: 'italic' }}>{a.expNoExhibits(formLang)}</div>
                      ) : (
                        (exhibitsList).map((ex, idx) => (
                          <div key={ex.id || idx} style={{ width: '100%' }}>
                            {editingExhibitId === ex.id ? (
                              <div style={{ background: 'var(--surface2)', padding: 20, borderRadius: 10, border: '1px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.expExhibitTitle}</label>
                                  <input 
                                    type="text" 
                                    value={editingExhibitTitle} 
                                    onChange={(e) => setEditingExhibitTitle(e.target.value)} 
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }} 
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.expDescription}</label>
                                  <textarea
                                    value={editingExhibitDesc} 
                                    onChange={(e) => setEditingExhibitDesc(e.target.value)} 
                                    rows={3} 
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }} 
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.expImage}</label>
                                  {editingExhibitImage && (
                                    <div style={{ width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 8 }}>
                                      <img src={`${API_URL}${editingExhibitImage}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      try {
                                        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
                                        if (res.ok) {
                                          const data = await res.json();
                                          setEditingExhibitImage(data.url);
                                        }
                                      } catch (err) { console.error(err); }
                                    }} 
                                    style={{ fontSize: 13 }} 
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                  <button 
                                    type="button" 
                                    onClick={async () => {
                                      if (!editingExhibitTitle) return alert('Title is required');
                                      try {
                                        const res = await fetch(`${API_URL}/api/museums/${editId}/exhibits/${ex.id}`, {
                                          method: 'PUT',
                                          headers: { 
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ title: editingExhibitTitle, description: editingExhibitDesc, image: editingExhibitImage })
                                        });
                                        if (res.ok) {
                                          setEditingExhibitId(null);
                                          setExhibitsList(prev => prev.map(x => x.id === ex.id ? { ...x, title: editingExhibitTitle, description: editingExhibitDesc, image: editingExhibitImage } : x));
                                        } else {
                                          alert('Failed to save exhibit');
                                        }
                                      } catch(err) { console.error(err); }
                                    }} 
                                    className="btn-primary"
                                    style={{ padding: '8px 16px', fontSize: 13 }}
                                  >
                                    {a.expSave}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingExhibitId(null)}
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: 13 }}
                                  >
                                    {a.expCancel}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface2)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                                {ex.image && (
                                  <div style={{ width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                                    <img src={`${API_URL}${ex.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600, color: 'var(--fg)' }}>{ex.title}</h5>
                                  <p style={{ fontSize: 13, margin: 0, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ex.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setEditingExhibitId(ex.id);
                                      setEditingExhibitTitle(ex.title || '');
                                      setEditingExhibitDesc(ex.description || '');
                                      setEditingExhibitImage(ex.image || '');
                                    }} 
                                    style={{ padding: '6px 12px', fontSize: 12, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)', borderRadius: 6, cursor: 'pointer' }}
                                  >
                                    {a.expEdit}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm(a.expDeleteConfirm)) {
                                        try {
                                          const res = await fetch(`${API_URL}/api/museums/${editId}/exhibits/${ex.id}`, { 
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                          });
                                          if (res.ok) setExhibitsList(prev => prev.filter(x => x.id !== ex.id));
                                          else alert('Failed to delete exhibit');
                                        } catch (e) {
                                          alert('Error deleting exhibit');
                                        }
                                      }
                                    }} 
                                    style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Form to add a new exhibit */}
                    <div style={{ background: 'var(--surface2)', border: '1px dashed var(--line)', borderRadius: 10, padding: 24 }}>
                      <h5 style={{ fontSize: 15, margin: '0 0 16px', fontWeight: 600, color: 'var(--fg)' }}>{a.expAddTitle(formLang)}</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.newsFieldTitle}</label>
                          <input type="text" id="new_exhibit_title" placeholder="Exhibit title" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.expImage}</label>
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
                              if (res.ok) {
                                const data = await res.json();
                                setNewExhibitImg(data.url);
                                alert('Image uploaded successfully!');
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }} style={{ fontSize: 13 }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.expDescription}</label>
                          <textarea id="new_exhibit_desc" rows={3} placeholder="Exhibit details..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }} />
                        </div>
                      </div>
                      <button type="button" onClick={async () => {
                        const title = document.getElementById('new_exhibit_title').value;
                        const description = document.getElementById('new_exhibit_desc').value;
                        const image = newExhibitImg || '';
                        if (!title) return alert('Title is required');

                        try {
                          const res = await fetch(`${API_URL}/api/museums/${editId}/exhibits?lang=${formLang}`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ title, description, image })
                          });
                          if (res.ok) {
                            const newEx = await res.json();
                            setNewExhibitImg('');
                            document.getElementById('new_exhibit_title').value = '';
                            document.getElementById('new_exhibit_desc').value = '';
                            setExhibitsList(prev => [...prev, { id: newEx.id || Date.now(), title, description, image }]);
                          } else {
                            alert('Failed to add exhibit');
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>{a.expAddExhibit}</button>
                    </div>

                    {/* LIFE CHRONOLOGY SECTION */}
                    <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
                      <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 6px', color: 'var(--fg)' }}>{a.chronoTitle}</h4>
                      <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>{a.chronoSub}</p>

                      {/* List of chronology entries */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {chronoList.length === 0 ? (
                          <div style={{ color: 'var(--muted)', fontSize: 14, fontStyle: 'italic' }}>{a.chronoNone(formLang)}</div>
                        ) : chronoList.map(item => (
                          <div key={item.id} style={{ background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
                            {editingChronoId === item.id ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'start' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.chronoYearLabel}</label>
                                  <input
                                    value={editingChronoYear}
                                    onChange={e => setEditingChronoYear(e.target.value)}
                                    placeholder={a.chronoYearPlaceholder}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.chronoTextLabel}</label>
                                  <textarea
                                    value={editingChronoText}
                                    onChange={e => setEditingChronoText(e.target.value)}
                                    placeholder={a.chronoTextPlaceholder}
                                    rows={2}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }}
                                  />
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => { setEditingChronoId(null); setEditingChronoYear(''); setEditingChronoText(''); }}
                                    style={{ padding: '7px 14px', fontSize: 12, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', borderRadius: 6, cursor: 'pointer' }}
                                  >{a.chronoCancel}</button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!editingChronoYear.trim()) return alert(a.chronoYearRequired);
                                      if (!editingChronoText.trim()) return alert(a.chronoTextRequired);
                                      try {
                                        const res = await fetch(`${API_URL}/api/museums/${editId}/chronology/${item.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ year: editingChronoYear, text: editingChronoText }),
                                        });
                                        if (res.ok) {
                                          setChronoList(prev => prev.map(x => x.id === item.id ? { ...x, year: editingChronoYear, text: editingChronoText } : x));
                                          setEditingChronoId(null); setEditingChronoYear(''); setEditingChronoText('');
                                        } else {
                                          alert('Failed to save');
                                        }
                                      } catch (err) { console.error(err); }
                                    }}
                                    className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}
                                  >{a.chronoSave}</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 14, alignItems: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, color: 'var(--accent)' }}>{item.year || '—'}</div>
                                <div style={{ fontSize: 14, color: 'var(--fg)', lineHeight: 1.5 }}>{item.text || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>—</span>}</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingChronoId(item.id);
                                      setEditingChronoYear(item.year || '');
                                      setEditingChronoText(item.text || '');
                                    }}
                                    style={{ padding: '6px 12px', fontSize: 12, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)', borderRadius: 6, cursor: 'pointer' }}
                                  >{a.expEdit || 'Edit'}</button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!window.confirm(a.chronoDeleteConfirm)) return;
                                      try {
                                        const res = await fetch(`${API_URL}/api/museums/${editId}/chronology/${item.id}`, {
                                          method: 'DELETE',
                                          headers: { 'Authorization': `Bearer ${token}` },
                                        });
                                        if (res.ok) {
                                          setChronoList(prev => prev.filter(x => x.id !== item.id));
                                        } else {
                                          alert('Failed to delete');
                                        }
                                      } catch (err) { console.error(err); }
                                    }}
                                    style={{ padding: '6px 10px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}
                                  >✕</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add form */}
                      <div style={{ background: 'var(--surface2)', border: '1px dashed var(--line)', borderRadius: 10, padding: 20 }}>
                        <h5 style={{ fontSize: 14, margin: '0 0 14px', fontWeight: 600, color: 'var(--fg)' }}>{a.chronoAddTitle(formLang)}</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, marginBottom: 14 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.chronoYearLabel}</label>
                            <input
                              value={newChronoYear}
                              onChange={e => setNewChronoYear(e.target.value)}
                              placeholder={a.chronoYearPlaceholder}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{a.chronoTextLabel}</label>
                            <textarea
                              value={newChronoText}
                              onChange={e => setNewChronoText(e.target.value)}
                              placeholder={a.chronoTextPlaceholder}
                              rows={2}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newChronoYear.trim()) return alert(a.chronoYearRequired);
                            if (!newChronoText.trim()) return alert(a.chronoTextRequired);
                            try {
                              const res = await fetch(`${API_URL}/api/museums/${editId}/chronology?lang=${formLang}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ year: newChronoYear, text: newChronoText }),
                              });
                              if (res.ok) {
                                const created = await res.json();
                                const y = newChronoYear;
                                const t = newChronoText;
                                setChronoList(prev => {
                                  const next = [...prev, { id: created.id, year: y, text: t }];
                                  next.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
                                  return next;
                                });
                                setNewChronoYear(''); setNewChronoText('');
                              } else {
                                alert('Failed to add');
                              }
                            } catch (err) { console.error(err); }
                          }}
                          className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}
                        >{a.chronoAdd}</button>
                      </div>
                    </div>

                    {/* NEWS UPDATE SECTION */}
                    <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
                      <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 20px', color: 'var(--fg)' }}>{a.newsTitle(formLang)}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        {newsList.map(n => (
                          <div key={n.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface2)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                            {n.image && (
                              <div style={{ width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                                <img src={`${API_URL}${n.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <h5 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600, color: 'var(--fg)' }}>{n.title}</h5>
                              <p style={{ fontSize: 13, margin: 0, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.content}</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={async () => {
                                if (window.confirm(a.newsDeleteConfirm)) {
                                  try {
                                    const res = await fetch(`${API_URL}/api/museums/${editId}/news/${n.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) {
                                      setNewsList(prev => prev.filter(x => x.id !== n.id));
                                    } else {
                                      alert('Failed to delete news article');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }} 
                              style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                        {newsList.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{a.newsNone}</div>}
                      </div>

                      {/* Add News Form */}
                      <div style={{ background: 'var(--surface2)', border: '1px dashed var(--line)', borderRadius: 10, padding: 24 }}>
                        <h5 style={{ fontSize: 15, margin: '0 0 16px', fontWeight: 600, color: 'var(--fg)' }}>{a.newsAddTitle}</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.newsFieldTitle}</label>
                            <input type="text" id="new_news_title" placeholder="News title" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.newsFieldImage}</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewNewsImage)} style={{ fontSize: 13 }} />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.newsFieldContent}</label>
                            <textarea id="new_news_content" rows={3} placeholder="News details..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }} />
                          </div>
                        </div>
                        <button type="button" onClick={async () => {
                          const title = document.getElementById('new_news_title').value;
                          const content = document.getElementById('new_news_content').value;
                          if (!title) return alert('Title is required');
                          
                          try {
                            const res = await fetch(`${API_URL}/api/museums/${editId}/news?lang=${formLang}`, {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ title, content, image: newNewsImage })
                            });
                            if (res.ok) {
                              const saved = await res.json();
                              setNewsList(prev => [{ id: saved.id, title, content, image: newNewsImage }, ...prev]);
                              document.getElementById('new_news_title').value = '';
                              document.getElementById('new_news_content').value = '';
                              setNewNewsImage('');
                              alert('News article posted successfully!');
                            } else {
                              alert('Failed to post news');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>{a.newsPost}</button>
                      </div>
                    </div>

                    {/* EVENTS SECTION */}
                    <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
                      <h4 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 20px', color: 'var(--fg)' }}>{a.eventsTitle(formLang)}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        {eventsList.map(ev => (
                          <div key={ev.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface2)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                            {ev.image && (
                              <div style={{ width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                                <img src={`${API_URL}${ev.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <h5 style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 600, color: 'var(--fg)' }}>{ev.title}</h5>
                              <p style={{ fontSize: 13, margin: '0 0 4px', color: 'var(--accent)', fontWeight: 500 }}>{a.eventsDateLabel} {ev.date}</p>
                              <p style={{ fontSize: 13, margin: 0, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={async () => {
                                if (window.confirm(a.eventsDeleteConfirm)) {
                                  try {
                                    const res = await fetch(`${API_URL}/api/museums/${editId}/events/${ev.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) {
                                      setEventsList(prev => prev.filter(x => x.id !== ev.id));
                                    } else {
                                      alert('Failed to delete event');
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }} 
                              style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                        {eventsList.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{a.eventsNone}</div>}
                      </div>

                      {/* Add Event Form */}
                      <div style={{ background: 'var(--surface2)', border: '1px dashed var(--line)', borderRadius: 10, padding: 24 }}>
                        <h5 style={{ fontSize: 15, margin: '0 0 16px', fontWeight: 600, color: 'var(--fg)' }}>{a.eventsAddTitle}</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.eventsFieldTitle}</label>
                            <input type="text" id="new_event_title" placeholder="Event title" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.eventsFieldDate}</label>
                            <input type="date" id="new_event_date" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.eventsFieldImage}</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewEventImage)} style={{ fontSize: 13 }} />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.eventsFieldDesc}</label>
                            <textarea id="new_event_desc" rows={3} placeholder="Event description..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 14, resize: 'vertical' }} />
                          </div>
                        </div>
                        <button type="button" onClick={async () => {
                          const title = document.getElementById('new_event_title').value;
                          const description = document.getElementById('new_event_desc').value;
                          const date = document.getElementById('new_event_date').value;
                          if (!title || !date) return alert('Title and Date are required');
                          
                          try {
                            const res = await fetch(`${API_URL}/api/museums/${editId}/events?lang=${formLang}`, {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ title, description, date, image: newEventImage })
                            });
                            if (res.ok) {
                              const saved = await res.json();
                              setEventsList(prev => [...prev, { id: saved.id, title, description, date, image: newEventImage }]);
                              document.getElementById('new_event_title').value = '';
                              document.getElementById('new_event_desc').value = '';
                              document.getElementById('new_event_date').value = '';
                              setNewEventImage('');
                              alert('Event scheduled successfully!');
                            } else {
                              alert('Failed to schedule event');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>{a.eventsSchedule}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })() : (
              <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                    <thead style={{ background: 'var(--surface2)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)' }}>
                      <tr>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>{a.tblMuseum}</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>{a.tblCity}</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>{a.tblStatus}</th>
                        <th style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{a.tblActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                        {allowedMuseums.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--line)', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0, border: '1px solid var(--line)' }}>
                                {m.heroImage && <img src={`${API_URL}${m.heroImage}`} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              </div>
                              <div>
                                <div style={{ color: 'var(--fg)', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{(m[lang] || m.uz || m.ru || m.en || m).name}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>ID: {m.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--fg)' }}>
                            <div style={{ display: 'inline-block', padding: '4px 10px', background: 'color-mix(in srgb, var(--fg) 8%, transparent)', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                              {m.city.charAt(0).toUpperCase() + m.city.slice(1)}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2E7D32', background: 'color-mix(in srgb, #2E7D32 10%, transparent)', padding: '4px 10px', borderRadius: 99, fontWeight: 600 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32' }} /> {a.tblActive}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button onClick={() => {
                              let parsedImgs = [];
                              try {
                                  if (m.heroImage) {
                                    if (m.heroImage.startsWith('[')) parsedImgs = JSON.parse(m.heroImage);
                                    else parsedImgs = [m.heroImage];
                                  }
                                } catch (e) {
                                  parsedImgs = [m.heroImage];
                                }
                                setEditId(m.id);
                                setFormLang(lang);
                                setUploadedHeroImages(parsedImgs);
                              }} style={{ padding: '8px 16px', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg)', fontWeight: 500, transition: 'all .2s' }}>{a.tblEdit}</button>
                              <button onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this museum?')) {
                                  try {
                                    const res = await fetch(`${API_URL}/api/museums/${m.id}`, { 
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) window.location.reload();
                                    else alert('Failed to delete museum');
                                  } catch (e) {
                                    alert('Error deleting museum');
                                  }
                                }
                              }} style={{ padding: '8px 16px', fontSize: 13, background: '#D32F2F', border: '1px solid #D32F2F', borderRadius: 8, cursor: 'pointer', color: 'white', fontWeight: 500, transition: 'all .2s', marginLeft: 8 }}>{a.tblDelete}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (() => {
          // Flatten quizzes with museum context
          const allQuizzes = [];
          allowedMuseums.forEach(m => {
            const mData = m[lang] || m.uz || {};
            const qList = mData.quiz || [];
            qList.forEach(q => {
              allQuizzes.push({
                museumId: m.id,
                museumName: mData.name,
                questionId: q.id,
                q: q.q,
                options: q.options,
                a: q.a
              });
            });
          });

          return (
            <div style={{ animation: 'fhFade .3s ease both' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32, alignItems: 'start' }}>
                
                {/* LIST OF EXISTING QUIZZES */}
                <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, margin: '0 0 24px', color: 'var(--fg)' }}>{a.quizActiveTitle}</h2>

                  {allQuizzes.length === 0 ? (
                    <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>{a.quizNone}</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {allQuizzes.map((q, idx) => (
                        <div key={q.questionId || idx} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 20, background: 'var(--surface2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                                {q.museumName}
                              </div>
                              <h4 style={{ fontSize: 16, margin: 0, color: 'var(--fg)', fontWeight: 600 }}>{q.q}</h4>
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm(a.quizDelete + '?')) {
                                  try {
                                    const res = await fetch(`${API_URL}/api/museums/${q.museumId}/quizzes/${q.questionId}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) window.location.reload();
                                    else alert('Failed to delete question');
                                  } catch (e) {
                                    alert('Error deleting question');
                                  }
                                }
                              }}
                              style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer', transition: 'all .2s' }}
                            >
                              {a.quizDelete}
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{ fontSize: 13.5, padding: '8px 12px', borderRadius: 8, background: q.a === oIdx ? 'color-mix(in srgb, #2E7D32 10%, transparent)' : 'var(--surface)', border: q.a === oIdx ? '1px solid #2E7D32' : '1px solid var(--line)', color: q.a === oIdx ? '#2E7D32' : 'var(--fg)', fontWeight: q.a === oIdx ? 600 : 400 }}>
                                {oIdx + 1}. {opt} {q.a === oIdx ? '✓' : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ADD NEW QUESTION FORM */}
                <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, margin: '0 0 24px', color: 'var(--fg)' }}>{a.quizAddTitle}</h2>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const museumId = formData.get('museumId');
                    const question = formData.get('question');
                    const options = [
                      formData.get('opt0'),
                      formData.get('opt1'),
                      formData.get('opt2'),
                      formData.get('opt3')
                    ];
                    const answer = parseInt(formData.get('answer'), 10);

                    try {
                      const res = await fetch(`${API_URL}/api/museums/${museumId}/quizzes?lang=${lang}`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ question, options, answer })
                      });
                      if (res.ok) {
                        window.location.reload();
                      } else {
                        alert('Failed to add quiz question');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error adding quiz question');
                    }
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.quizSelectMuseum}</label>
                        <select name="museumId" required style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}>
                          {allowedMuseums.map(m => (
                            <option key={m.id} value={m.id}>{(m[lang] || m.uz || {}).name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.quizQuestion(lang)}</label>
                        <input name="question" type="text" required placeholder="e.g. In which year was the poet born?" style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }} />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.quizOptions(lang)}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input name="opt0" type="text" required placeholder="Option 1" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt1" type="text" required placeholder="Option 2" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt2" type="text" required placeholder="Option 3" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                          <input name="opt3" type="text" required placeholder="Option 4" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14.5, outline: 'none' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.quizCorrect}</label>
                        <select name="answer" required style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}>
                          <option value="0">Option 1</option>
                          <option value="1">Option 2</option>
                          <option value="2">Option 3</option>
                          <option value="3">Option 4</option>
                        </select>
                      </div>

                      <button type="submit" className="btn-primary" style={{ padding: 16, fontSize: 15, marginTop: 8 }}>{a.quizAddBtn}</button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          );
        })()}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, margin: '0 0 6px', color: 'var(--fg)' }}>{a.settingsTitle}</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5 }}>{a.settingsSub}</p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/site-translations`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(siteTranslations)
                    });
                    if (res.ok) {
                      refreshTranslations();
                      alert('Translations saved successfully!');
                    } else {
                      alert('Failed to save translations');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error saving translations');
                  }
                }}
                className="btn-primary" 
                style={{ padding: '12px 24px', fontSize: 14 }}
              >
                {a.settingsSave}
              </button>
            </header>

            {/* Search filter bar */}
            <div style={{ marginBottom: 24 }}>
              <input 
                type="text" 
                placeholder={a.settingsSearch} 
                value={translationsSearchQuery}
                onChange={(e) => setTranslationsSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(() => {
                const q = translationsSearchQuery.toLowerCase();
                const filtered = siteTranslations.filter(item =>
                  (item.key || '').toLowerCase().includes(q) ||
                  (item.uz || '').toLowerCase().includes(q) ||
                  (item.ru || '').toLowerCase().includes(q) ||
                  (item.en || '').toLowerCase().includes(q)
                );
                
                if (filtered.length === 0) {
                  return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>{a.settingsNotFound}</div>;
                }

                return filtered.map(item => (
                  <div key={item.key} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--accent)', fontSize: 14, letterSpacing: '.05em' }}>{item.key}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{a.settingsUiKey}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>UZ</label>
                        <input 
                          type="text" 
                          value={item.uz} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteTranslations(prev => prev.map(o => o.key === item.key ? { ...o, uz: val } : o));
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14 }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>RU</label>
                        <input 
                          type="text" 
                          value={item.ru} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteTranslations(prev => prev.map(o => o.key === item.key ? { ...o, ru: val } : o));
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14 }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>EN</label>
                        <input 
                          type="text" 
                          value={item.en} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSiteTranslations(prev => prev.map(o => o.key === item.key ? { ...o, en: val } : o));
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14 }} 
                        />
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/site-translations`, {
                      method: 'PUT',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(siteTranslations)
                    });
                    if (res.ok) {
                      refreshTranslations();
                      alert('Translations saved successfully!');
                    } else {
                      alert('Failed to save translations');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error saving translations');
                  }
                }}
                className="btn-primary" 
                style={{ padding: '14px 28px', fontSize: 15 }}
              >
                {a.settingsSave}
              </button>
            </div>
          </div>
        )}

        {/* NEWS & EVENTS TAB */}
        {activeTab === 'news_events' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 6px', color: 'var(--fg)' }}>{a.neTitle}</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{a.neSub}</p>
              </div>
              {/* Lang switcher */}
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface2)', borderRadius: 99 }}>
                {['uz', 'ru', 'en'].map(l => (
                  <button key={l} onClick={() => setNeLang(l)} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none', padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', background: neLang === l ? 'var(--accent)' : 'transparent', color: neLang === l ? 'var(--accent-fg)' : 'var(--muted)', transition: 'all .2s' }}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
              {[['news', a.neSubNews], ['events', a.neSubEvents]].map(([id, label]) => (
                <button key={id} onClick={() => setNeSubTab(id)} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: neSubTab === id ? '2px solid var(--accent)' : '2px solid transparent', padding: '10px 22px', fontSize: 14.5, fontWeight: neSubTab === id ? 700 : 400, color: neSubTab === id ? 'var(--fg)' : 'var(--muted)', transition: 'all .2s', marginBottom: -1 }}>{label}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>

              {/* LEFT: LIST */}
              <div>
                {neLoading && <div style={{ color: 'var(--muted)', padding: 20 }}>{a.neLoading}</div>}

                {/* NEWS LIST */}
                {!neLoading && neSubTab === 'news' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {allNewsGlobal.length === 0 && (
                      <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '40px 24px', textAlign: 'center', color: 'var(--muted)' }}>{a.neNewsNone}</div>
                    )}
                    {allNewsGlobal.map(n => (
                      <div key={n.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, position: 'relative' }}>
                        <div style={{ width: 4, position: 'absolute', left: 0, top: 0, bottom: 0, background: 'var(--accent)', borderRadius: '12px 0 0 12px' }} />
                        {n.image && (
                          <div style={{ width: 72, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
                            <img src={`${API_URL}${n.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-fg)' }}>{n.museum_name || a.neAllMuseums}</span>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n.created_at ? new Date(n.created_at).toLocaleDateString('ru-RU') : ''}</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{n.title || '—'}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.content}</div>
                        </div>
                        <button onClick={async () => {
                          if (!window.confirm(a.neDeleteNewsConfirm)) return;
                          try {
                            const res = await fetch(`${API_URL}/api/museums/${n.museum_id}/news/${n.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                            if (res.ok) setAllNewsGlobal(prev => prev.filter(x => x.id !== n.id));
                            else alert(a.neDeleteError);
                          } catch (e) { console.error(e); }
                        }} style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}>
                          {a.neDeleteBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* EVENTS LIST */}
                {!neLoading && neSubTab === 'events' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {allEventsGlobal.length === 0 && (
                      <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '40px 24px', textAlign: 'center', color: 'var(--muted)' }}>{a.neEventsNone}</div>
                    )}
                    {allEventsGlobal.map(e => {
                      const p = (e.date || '').split('-');
                      const day = p[2] ? String(+p[2]) : '?';
                      const mon = a.months[+p[1] - 1] || '';
                      return (
                        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 16, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px', position: 'relative' }}>
                          <div style={{ width: 4, position: 'absolute', left: 0, top: 0, bottom: 0, background: 'var(--accent)', borderRadius: '12px 0 0 12px' }} />
                          <div style={{ textAlign: 'center', borderRight: '1px solid var(--line)', paddingRight: 12 }}>
                            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 28, color: 'var(--accent)', lineHeight: 1 }}>{day}</div>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginTop: 2 }}>{mon}</div>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-fg)' }}>{e.museum_name || a.neAllMuseums}</span>
                              {e.time && <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{e.time}</span>}
                            </div>
                            <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--fg)', marginBottom: 3 }}>{e.title || '—'}</div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.description}</div>
                          </div>
                          <button onClick={async () => {
                            if (!window.confirm(a.neDeleteEventConfirm)) return;
                            try {
                              const res = await fetch(`${API_URL}/api/museums/${e.museum_id}/events/${e.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                              if (res.ok) setAllEventsGlobal(prev => prev.filter(x => x.id !== e.id));
                              else alert(a.neDeleteError);
                            } catch (e2) { console.error(e2); }
                          }} style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer', alignSelf: 'flex-start' }}>
                            {a.neDeleteBtn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: ADD FORM */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'calc(var(--radius) * 1.5)', padding: 28, position: 'sticky', top: 24 }}>

                {/* ADD NEWS FORM */}
                {neSubTab === 'news' && (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 22px', color: 'var(--fg)' }}>{a.neAddNews}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neMuseum}</label>
                        <select value={neMuseumId} onChange={e => setNeMuseumId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none' }}>
                          <option value="">{a.neSelectMuseum}</option>
                          {allowedMuseums.map(m => (
                            <option key={m.id} value={m.id}>{(m[neLang] || m.ru || m.uz || {}).name || m.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neHeadlineLabel}</label>
                        <input type="text" value={newsForm.title} onChange={e => setNewsForm(f => ({ ...f, title: e.target.value }))} placeholder={a.neHeadlinePlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neContentLabel}</label>
                        <textarea value={newsForm.content} onChange={e => setNewsForm(f => ({ ...f, content: e.target.value }))} rows={4} placeholder={a.neContentPlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.nePhotoLabel}</label>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, url => setNewsForm(f => ({ ...f, image: url })))} style={{ fontSize: 13 }} />
                        {newsForm.image && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>{a.neUploaded}</div>}
                      </div>
                      <button onClick={async () => {
                        if (!neMuseumId) return alert(a.neSelectMuseumAlert);
                        if (!newsForm.title) return alert(a.neTitleAlert);
                        try {
                          const res = await fetch(`${API_URL}/api/museums/${neMuseumId}/news?lang=${neLang}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ title: newsForm.title, content: newsForm.content, image: newsForm.image })
                          });
                          if (res.ok) {
                            setNewsForm({ title: '', content: '', image: '' });
                            await fetchAllNewsEvents();
                          } else alert(a.neSaveError);
                        } catch (e) { console.error(e); }
                      }} className="btn-primary" style={{ padding: '12px', fontSize: 14, width: '100%' }}>
                        {a.nePublish}
                      </button>
                    </div>
                  </>
                )}

                {/* ADD EVENT FORM */}
                {neSubTab === 'events' && (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, margin: '0 0 22px', color: 'var(--fg)' }}>{a.neAddEvent}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neMuseum}</label>
                        <select value={neMuseumId} onChange={e => setNeMuseumId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none' }}>
                          <option value="">{a.neSelectMuseum}</option>
                          {allowedMuseums.map(m => (
                            <option key={m.id} value={m.id}>{(m[neLang] || m.ru || m.uz || {}).name || m.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neEventNameLabel}</label>
                        <input type="text" value={eventsForm.title} onChange={e => setEventsForm(f => ({ ...f, title: e.target.value }))} placeholder={a.neEventNamePlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neEventDateLabel}</label>
                          <input type="date" value={eventsForm.date} onChange={e => setEventsForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neEventTimeLabel}</label>
                          <input type="time" value={eventsForm.time} onChange={e => setEventsForm(f => ({ ...f, time: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.neEventDescLabel}</label>
                        <textarea value={eventsForm.description} onChange={e => setEventsForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder={a.neEventDescPlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <button onClick={async () => {
                        if (!neMuseumId) return alert(a.neSelectMuseumAlert);
                        if (!eventsForm.title || !eventsForm.date) return alert(a.neEventDateAlert);
                        try {
                          const res = await fetch(`${API_URL}/api/museums/${neMuseumId}/events?lang=${neLang}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ title: eventsForm.title, description: eventsForm.description, date: eventsForm.date, time: eventsForm.time })
                          });
                          if (res.ok) {
                            setEventsForm({ title: '', description: '', date: '', time: '' });
                            await fetchAllNewsEvents();
                          } else alert(a.neSaveError);
                        } catch (e) { console.error(e); }
                      }} className="btn-primary" style={{ padding: '12px', fontSize: 14, width: '100%' }}>
                        {a.neEventAdd}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMINS MANAGEMENT TAB */}
        {activeTab === 'admins' && user?.role === 'super_admin' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, margin: '0 0 24px', color: 'var(--fg)' }}>{a.adminsTitle}</h1>

            {/* Superadmin credentials card */}
            <div style={{ background: 'color-mix(in srgb, var(--accent) 10%, var(--surface))', border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)', borderRadius: 14, padding: '20px 28px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>S</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>{a.adminsSuperLabel}</div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, color: 'var(--fg)' }}>{a.adminsLoginLabel} <strong style={{ fontFamily: 'monospace' }}>superadmin</strong></span>
                  <span style={{ fontSize: 15, color: 'var(--fg)' }}>{a.adminsPassLabel} <strong style={{ fontFamily: 'monospace' }}>superpassword</strong></span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 220 }}>{a.adminsSuperNote}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, alignItems: 'start' }}>
              {/* ADMINS LIST */}
              <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, margin: '0 0 20px', color: 'var(--fg)' }}>{a.adminsActiveTitle}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {adminsList.map(adm => (
                    <div key={adm.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 20, background: 'var(--surface2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg)', fontFamily: 'monospace' }}>{adm.username}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{a.adminsRole(adm.role)}</div>
                          <div style={{ fontSize: 13, color: 'var(--accent)', marginTop: 2 }}>
                            {a.adminsMuseums(adm.museums)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => { setResetPasswordId(adm.id); setResetPasswordValue(''); setShowResetPassword(false); }}
                            style={{ padding: '6px 12px', fontSize: 12, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)', borderRadius: 6, cursor: 'pointer' }}
                          >
                            {a.adminsResetPwd}
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(a.adminsDeleteConfirm(adm.username))) {
                                try {
                                  const res = await fetch(`${API_URL}/api/auth/admins/${adm.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (res.ok) setAdminsList(prev => prev.filter(x => x.id !== adm.id));
                                  else alert(a.adminsDeleteError);
                                } catch (e) { console.error(e); }
                              }
                            }}
                            style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}
                          >
                            {a.adminsDelete}
                          </button>
                        </div>
                      </div>
                      {/* Inline reset password form */}
                      {resetPasswordId === adm.id && (
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--line)' }}>
                          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 10 }}>{a.adminsNewPwd(adm.username)}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <input
                                type={showResetPassword ? 'text' : 'password'}
                                value={resetPasswordValue}
                                onChange={e => setResetPasswordValue(e.target.value)}
                                placeholder={a.adminsNewPwdPlaceholder}
                                style={{ width: '100%', padding: '9px 70px 9px 12px', borderRadius: 7, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                              />
                              <button type="button" onClick={() => setShowResetPassword(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12 }}>
                                {showResetPassword ? a.adminsHide : a.adminsShow}
                              </button>
                            </div>
                            <button
                              onClick={async () => {
                                if (!resetPasswordValue) return alert(a.adminsPwdRequired);
                                const res = await fetch(`${API_URL}/api/auth/admins/${adm.id}/password`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ password: resetPasswordValue })
                                });
                                if (res.ok) { setResetPasswordId(null); setResetPasswordValue(''); alert(a.adminsPwdUpdated(adm.username)); }
                                else alert(a.adminsPwdError);
                              }}
                              style={{ padding: '9px 16px', fontSize: 13, background: 'var(--accent)', border: 'none', color: 'var(--accent-fg)', borderRadius: 7, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              {a.adminsSave}
                            </button>
                            <button onClick={() => setResetPasswordId(null)} style={{ padding: '9px 12px', fontSize: 13, background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--muted)', borderRadius: 7, cursor: 'pointer' }}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {adminsList.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 14 }}>{a.adminsNone}</div>}
                </div>
              </div>

              {/* GENERATE ACCOUNT FORM */}
              <div style={{ background: 'var(--surface)', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--line)', padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, margin: '0 0 20px', color: 'var(--fg)' }}>{a.adminsGenerateTitle}</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const username = formData.get('username');
                  const password = formData.get('password');
                  const selectedMuseums = museums
                    .filter(m => formData.get(`mus_${m.id}`) === 'on')
                    .map(m => m.id);

                  try {
                    const res = await fetch(`${API_URL}/api/auth/admins`, {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        username,
                        password,
                        role: 'museum_admin',
                        museums: selectedMuseums
                      })
                    });
                    if (res.ok) {
                      alert(a.adminsCreateSuccess);
                      e.target.reset();
                      // Refresh list
                      const resList = await fetch(`${API_URL}/api/auth/admins`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (resList.ok) setAdminsList(await resList.json());
                    } else {
                      const data = await res.json();
                      alert(data.error || a.adminsCreateError);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.adminsUsernameLabel}</label>
                      <input name="username" type="text" required placeholder="e.g. uvaysi_manager" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>{a.adminsPasswordLabel}</label>
                      <div style={{ position: 'relative' }}>
                        <input name="password" type={showAdminPassword ? 'text' : 'password'} required placeholder="Enter password" style={{ width: '100%', padding: '10px 44px 10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                        <button type="button" onClick={() => setShowAdminPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: 0 }}>
                          {showAdminPassword ? a.adminsHide : a.adminsShow}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.adminsAssignMuseums}</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {museums.map(m => (
                          <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg)', cursor: 'pointer' }}>
                            <input name={`mus_${m.id}`} type="checkbox" />
                            {(m[lang] || m.uz || {}).name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: 12, fontSize: 14, marginTop: 10 }}>{a.adminsGenerate}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* EXPOSITION TAB */}
        {activeTab === 'exposition' && (
          <div style={{ animation: 'fhFade .3s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, margin: '0 0 6px', color: 'var(--fg)' }}>{a.expoTitle}</h1>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{a.expoSub}</p>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface2)', borderRadius: 99 }}>
                {['uz', 'ru', 'en'].map(l => (
                  <button key={l} onClick={() => setExpoLang(l)} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none', padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', background: expoLang === l ? 'var(--accent)' : 'transparent', color: expoLang === l ? 'var(--accent-fg)' : 'var(--muted)', transition: 'all .2s' }}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Museum selector */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{a.expoSelectMuseum}</label>
              <select value={expoMuseumId} onChange={e => { setExpoMuseumId(e.target.value); setExpoEditId(null); }} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', fontSize: 15, minWidth: 320, outline: 'none' }}>
                <option value="">{a.expoSelectOption}</option>
                {allowedMuseums.map(m => (
                  <option key={m.id} value={m.id}>{(m[lang] || m.uz || {}).name || m.id}</option>
                ))}
              </select>
            </div>

            {expoMuseumId && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

                {/* LEFT: Photo grid */}
                <div>
                  {expoLoading && <div style={{ color: 'var(--muted)', padding: 20 }}>{a.expoLoading}</div>}
                  {!expoLoading && expoExhibits.length === 0 && (
                    <div style={{ border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                      {a.expoNone}
                    </div>
                  )}
                  {!expoLoading && expoExhibits.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {expoExhibits.map(ex => (
                        <div key={ex.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                          {ex.image && (
                            <div style={{ height: 150, overflow: 'hidden', background: 'var(--surface2)' }}>
                              <img src={`${API_URL}${ex.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ padding: 14 }}>
                            {ex.hall_num && (
                              <span style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: 4, display: 'block' }}>{a.expoHall(ex.hall_num)}</span>
                            )}
                            {expoEditId === ex.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <input value={expoEditTitle} onChange={e => setExpoEditTitle(e.target.value)} placeholder={a.expoTitlePlaceholder} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 13, width: '100%' }} />
                                <textarea value={expoEditDesc} onChange={e => setExpoEditDesc(e.target.value)} placeholder={a.expoDescPlaceholder} rows={2} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 13, width: '100%', resize: 'vertical' }} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={async () => {
                                    const res = await fetch(`${API_URL}/api/museums/${expoMuseumId}/exhibits/${ex.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ title: expoEditTitle, description: expoEditDesc, image: ex.image })
                                    });
                                    if (res.ok) {
                                      setExpoExhibits(prev => prev.map(x => x.id === ex.id ? { ...x, title: expoEditTitle, description: expoEditDesc } : x));
                                      setExpoEditId(null);
                                    } else alert(a.expoSaveError);
                                  }} style={{ flex: 1, padding: '6px 0', fontSize: 12, background: 'var(--accent)', border: 'none', color: 'var(--accent-fg)', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{a.expoSaveBtn}</button>
                                  <button onClick={() => setExpoEditId(null)} style={{ padding: '6px 10px', fontSize: 12, background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--muted)', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg)', marginBottom: 2 }}>{ex.title || '—'}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ex.description}</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => { setExpoEditId(ex.id); setExpoEditTitle(ex.title || ''); setExpoEditDesc(ex.description || ''); }} style={{ flex: 1, padding: '6px 0', fontSize: 12, background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--fg)', borderRadius: 6, cursor: 'pointer' }}>{a.expoEditBtn}</button>
                                  <button onClick={async () => {
                                    if (!window.confirm(a.expoDeletePhotoConfirm)) return;
                                    const res = await fetch(`${API_URL}/api/museums/${expoMuseumId}/exhibits/${ex.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                    if (res.ok) setExpoExhibits(prev => prev.filter(x => x.id !== ex.id));
                                    else alert(a.expoDeleteError);
                                  }} style={{ padding: '6px 10px', fontSize: 12, background: 'transparent', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Add form */}
                <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: 28, position: 'sticky', top: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, margin: '0 0 20px', color: 'var(--fg)' }}>{a.expoAddFormTitle}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.expoPhotoLabel}</label>
                      {expoAddImg && (
                        <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', height: 120 }}>
                          <img src={`${API_URL}${expoAddImg}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd });
                        if (res.ok) { const d = await res.json(); setExpoAddImg(d.url); }
                      }} style={{ fontSize: 13, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.expoOptNameLabel}</label>
                      <input id="expo_add_title" type="text" placeholder={a.expoOptNamePlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{a.expoOptDescLabel}</label>
                      <textarea id="expo_add_desc" rows={3} placeholder={a.expoOptDescPlaceholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--fg)', fontSize: 14, resize: 'vertical', outline: 'none' }} />
                    </div>
                    <button onClick={async () => {
                      if (!expoAddImg) return alert(a.expoPhotoRequired);
                      const title = document.getElementById('expo_add_title').value;
                      const description = document.getElementById('expo_add_desc').value;
                      const res = await fetch(`${API_URL}/api/museums/${expoMuseumId}/exhibits?lang=${expoLang}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ title, description, image: expoAddImg })
                      });
                      if (res.ok) {
                        const newEx = await res.json();
                        setExpoExhibits(prev => [...prev, { id: newEx.id || Date.now(), title, description, image: expoAddImg }]);
                        setExpoAddImg('');
                        document.getElementById('expo_add_title').value = '';
                        document.getElementById('expo_add_desc').value = '';
                      } else {
                        alert(a.expoAddError);
                      }
                    }} className="btn-primary" style={{ padding: '12px 0', fontSize: 14, width: '100%' }}>{a.expoAddBtn}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
