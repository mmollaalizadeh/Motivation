# قدم‌های فاطمه — Live v4

یک PWA فارسی برای انگیزه، یادگیری و جایزه با دو صفحه:
- `index.html` اپ فاطمه
- `partner.html` پنل همراه/مدیریت

## امکانات
- موجودی XP قابل خرج + XP کل جداگانه
- Level که با خرج جایزه پایین نمی‌آید
- ماموریت روزانه، Progress Ring و Streak
- Rest Day بدون پیام منفی
- Mood check-in
- Reward Shop با کم شدن واقعی موجودی XP
- Achievementها
- Focus Timer و XP خودکار بعد از پایان
- پیام روزانه + پیام زنده از طرف همراه
- افزودن ماموریت و جایزه از پنل همراه
- افزایش/کاهش آنلاین XP از پنل همراه
- تاریخچه فعالیت‌ها
- ذخیره محلی + Sync زنده با Supabase Broadcast
- PWA و حالت آفلاین

## چرا GitHub JSON به تنهایی کافی نیست؟
GitHub Pages استاتیک است. مرورگر فایل JSON داخل Repository را می‌خواند، اما برای تغییر/Commit کردن آن نیاز به GitHub Token دارد. گذاشتن Token داخل JavaScript عمومی ناامن است. در این نسخه GitHub Pages همچنان میزبان کل UI است و Supabase فقط یک ردیف JSON را نگه می‌دارد.

## راه‌اندازی — حدود 5 دقیقه

### 1) ساخت Supabase
در supabase.com یک Project رایگان بساز.

### 2) ساخت جدول و امنیت
در Supabase وارد `SQL Editor` شو. محتوای فایل `SUPABASE_SETUP.sql` را کامل Paste و Run کن.

### 3) تنظیم `config.js`
از Supabase بخش Project Settings / API یا Connect این دو مورد را بگیر:
- Project URL
- Publishable key (یا anon key قدیمی)

داخل `config.js` قرار بده:
```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_KEY: "sb_publishable_..."
};
```
هرگز `service_role` key را داخل سایت قرار نده.

### 4) آپلود روی GitHub Pages
تمام فایل‌های این پوشه را در Root همان Repository قبلی جایگزین کن و Commit بزن. GitHub Actions/Static HTML خودش Deploy می‌کند.

### 5) ساخت لینک‌های خصوصی
بعد از Deploy برو به:
`https://USERNAME.github.io/REPO/setup.html`

روی «ساخت فضای مشترک فاطمه» بزن. دو لینک می‌گیری:
- لینک فاطمه: فقط روی گوشی فاطمه باز شود.
- لینک همراه: فقط برای خودت است و Admin token دارد.

هر دستگاه لینک را بار اول در مرورگر باز کند؛ اطلاعات اتصال روی همان دستگاه ذخیره می‌شود و توکن‌ها از نوار آدرس پاک می‌شوند.

## استفاده روزمره
### فاطمه
- Mood را انتخاب می‌کند.
- مأموریت‌ها را تیک می‌زند و XP می‌گیرد.
- Focus Timer را کامل می‌کند و XP می‌گیرد.
- وقتی موجودی کافی دارد از Reward Shop جایزه را «خرج» می‌کند؛ موجودی کم می‌شود ولی XP کل و Level حفظ می‌شود.

### همراه
- `partner.html` را باز می‌کنی.
- XP را همان لحظه + یا - می‌کنی.
- پیام روز می‌فرستی.
- ماموریت یا جایزه جدید اضافه می‌کنی.
- فعالیت و خرج امتیاز را زنده می‌بینی.

## نکته امنیتی
- `SUPABASE_KEY` از نوع Publishable/anon برای استفاده در مرورگر است؛ امنیت داده با RLS انجام می‌شود.
- لینک‌های خصوصی شامل Room Key هستند. آن‌ها را عمومی نکن.
- این اپ برای استفاده شخصی طراحی شده، نه اطلاعات بانکی یا حساس.

## اگر تغییرات زنده نبود
1. اینترنت هر دو دستگاه روشن باشد.
2. هر دو لینک از همان Setup ساخته شده باشند.
3. `SUPABASE_SETUP.sql` بدون Error اجرا شده باشد.
4. `config.js` شامل Project URL و Publishable key درست باشد.
5. یک Refresh انجام بده؛ داده Persist شده و دوباره Load می‌شود.
