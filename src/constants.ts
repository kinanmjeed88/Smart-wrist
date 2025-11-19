
import { PersonalInfoItem } from './types';

export const APP_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDZTRkQ3IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzQjgyRjYiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExMTgyNyIgLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgc3Ryb2tlPSJ1cmwoI2xvZ29HcmFkKSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2UtZGFzaGFycmF5PSIyODAgNDAiIHRyYW5zZm9ybT0icm90YXRlKDQ1IDUwIDUwKSIgLz4KICA8IS0tIFRlY2ggVCBzaGFwZSAtLT4KICA8cGF0aCBkPSJNMzAgMzVINTAgVjcwIiBzdHJva2U9InVybCgjbG9nb0dyYWQpIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KICA8cGF0aCBkPSJNNTAgMzVINzAiIHN0cm9rZT0idXJsKCNsb2dvR3JhZCkiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDwhLS0gQ2lyY3VpdCBkb3RzIC0tPgogIDxjaXJjbGUgY3g9IjMwIiBjeT0iMzUiIHI9IjQiIGZpbGw9IiMzQjgyRjYiIC8+CiAgPGNpcmNsZSBjeD0iNzAiIGN5PSIzNSIgcj0iNCIgZmlsbD0iIzA2Q0ZENyIgLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjcwIiByPSI0IiBmaWxsPSIjMDZTRkQ3IiAvPgo8L3N2Zz4=";

// مسار الصورة المحلية (يجب وضع الصورة في مجلد public)
export const LOCAL_USER_IMAGE = "./pickinan.png";

// Fallback image if local is not found (Unsplash example)
export const USER_PROFILE_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80";


export const SYSTEM_PROMPT = `•لا تُقدِّم أي محتوى تم توليده أو استنتاجه أو التكهن به أو استدلاله على أنه حقيقة.
•إذا لم تتمكن من التحقق من معلومة بشكل مباشر، قل: 
-“لا يمكنني التحقق من هذه المعلومة.”
- “ليست لدي صلاحية للوصول إلى هذه المعلومات.” •“قاعدة معرفتي لا تحتوي على هذه المعلومة.”
•ضع وسمًا في بداية الجملة لأي محتوى غير مؤكد: 
-[استنتاج] [تكهن] [غير مؤكد] 
•اطلب توضيحًا إذا كانت هناك معلومات ناقصة. لا تفترض ولا تملأ الفراغات بالتخمين.
•إذا كانت أيّ فقرة تحتوي على جزء غير مؤكد، ضع وسم “غير مؤكد” على الرد بالكامل. •لا تعِد صياغة أو تفسير مدخلات المستخدم ما لم يُطلب منك ذلك صراحةً.
•إذا استخدمت كلمات مثل: 
-“يمنع”، “يضمن”، “لن يحدث أبدًا”، “يُصلح”، “يقضي على”، “يؤكد أن” فيجب وسم الادعاء على أنه غير مؤكد ما لم يكن موثقًا بمصدر.
•فيما يتعلق بادعاءات عن سلوك النماذج اللغوية (بما في ذلك نفسك)، يجب إدراج: [استنتاج] أو [غير مؤكد]، مع ملاحظة أنه يعتمد على “أنماط ملاحظة”.

##⁧‫#انتبه‬⁩: إذا خالفت هذه القواعد، قل: تصحيح: قدمت سابقًا ادعاءً غير مؤكد. كان ذلك خطأ وكان يجب وسمه على هذا النحو.
•لا تغير أو تعدل مدخلات المستخدم ما لم يُطلب منك ذلك

تتأكد من أن جميع الإجابات على أسئلتي تأتي من مصادر موثوقة. وقم دائمًا بتضمين الاستشهادات والروابط لمصادر المعلومات. وكذلك يجب أن تكون الإجابات مبنية على الحقائق العلمية الصحيحة. قل الأمر كما هو، ولا تُجَمِل الإجابات. فكر من وجهة نظر تقدمية. استخدم أسلوبًا رسميًا احترافيًا. إضافة ملفات وصور بدون حدود. عملي، مباشر، بدون هراء تطابق نبرتي قل الأمر كما هو. بلا تجميل. بلا أسئلة زائفة. جمل كاملة، وضوح حقيقي. اجعل صوتك ذكيًا, راسخًا, مباشرًا كأنك فعلاً تساعد, وليس كأنك تراقب الأطفال
معزز بالمصادر الرسمية`;

export const PERSONAL_DATA_STRUCTURED: PersonalInfoItem[] = [
  { name: 'بوت الطلبات والتواصل', url: 'https://t.me/techtouchAI_bot', category: 'bot', keywords: ['bot', 'بوت', 'طلبات', 'techtouchAI_bot', 'تواصل'] },
  { name: 'لمسة تقنية techtouch', url: 'https://t.me/techtouch7', category: 'telegram', keywords: ['techtouch', 'تقنية', 'لمسة', 'techtouch7'] },
  { name: 'مناقشات techtouch', url: 'https://t.me/techtouch6', category: 'telegram', keywords: ['مناقشات', 'discussion', 'techtouch6'] },
  { name: 'TechTouch Gaming', url: 'https://t.me/techtouch0', category: 'telegram', keywords: ['gaming', 'games', 'العاب', 'جيمينج', 'techtouch0'] },
  { name: 'مناقشات Gaming', url: 'https://t.me/+ga-cVRm_MVNmNjFi', category: 'telegram', keywords: ['gaming', 'games', 'العاب', 'جيمينج', 'مناقشات'] },
  { name: 'GAME PS&PC', url: 'https://t.me/techtouch4', category: 'telegram', keywords: ['ps', 'pc', 'playstation', 'بلايستيشن', 'game', 'techtouch4'] },
  { name: 'مناقشات pc & ps', url: 'https://t.me/+B1bDJP1Tb143ZmUy', category: 'telegram', keywords: ['ps', 'pc', 'playstation', 'بلايستيشن', 'game', 'مناقشات'] },
  { name: 'قناة العــراق', url: 'https://t.me/techtouch01', category: 'telegram', keywords: ['العراق', 'iraq', 'techtouch01'] },
  { name: 'روابط البث المباشر', url: 'https://t.me/techtouch9', category: 'telegram', keywords: ['بث', 'مباشر', 'live', 'stream', 'techtouch9'] },
  { name: 'العاب PS2', url: 'https://t.me/+a8ibDqXvgpc3MDIy', category: 'telegram', keywords: ['ps2', 'playstation 2', 'بلايستيشن 2'] },
  { name: 'العاب PS3', url: 'https://t.me/+7P4DCjUqJzs5MGMy', category: 'telegram', keywords: ['ps3', 'playstation 3', 'بلايستيشن 3'] },
  { name: 'العاب Winlator', url: 'https://t.me/+RSUhB6QkeAplOWYy', category: 'telegram', keywords: ['winlator'] },
  { name: 'كل القنوات بمجلد واحد', url: 'https://t.me/addlist/Gxcy1FFJONhkMjFi', category: 'telegram-folder', keywords: ['كل', 'all', 'مجلد', 'folder', 'تجميعة'] },
  { name: 'قناة اليوتيوب', url: 'https://youtube.com/@kinanmajeed?si=I2yuzJT2rRnEHLVg', category: 'youtube', keywords: ['youtube', 'يوتيوب', 'فيديو', 'فيديوهات', 'قناتي'] },
  { name: 'حساب تيكتوك', url: 'https://www.tiktok.com/@techtouch6', category: 'tiktok', keywords: ['tiktok', 'تيكتوك', 'تيك توك'] },
  { name: 'صفحة الفيسبوك', url: 'https://www.facebook.com/share/172Cr1ygFt/', category: 'facebook', keywords: ['facebook', 'فيسبوك', 'فيس'] },
  { name: 'حساب انستغرام', url: 'https://www.instagram.com/techtouch0', category: 'instagram', keywords: ['instagram', 'انستغرام', 'انستا'] },
];
