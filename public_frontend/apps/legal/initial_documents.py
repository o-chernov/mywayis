"""
Стартовые тексты юридических документов.

ВАЖНО: это рабочие черновики, а не документы за подписью юриста. Перед
запуском приёма платежей их обязан вычитать профильный специалист —
особенно оферту, политику возврата и обработку персональных данных.

Тексты лежат отдельным модулем, а не внутри миграции: полторы тысячи строк
в файле миграции нечитаемы. Содержимое всё равно редактируется в админке,
поэтому расхождение старой миграции с текущим модулем ничего не ломает.

Плейсхолдеры вида {{COMPANY_*}} заполняются из настроек сайта при первом
редактировании — оставлять выдуманные ИНН и адреса в документах нельзя.
"""

from __future__ import annotations

import datetime

EFFECTIVE_DATE = datetime.date(2026, 1, 1)

# ─────────────────────────────────────────────────────────────────────────
#  Российская юрисдикция
# ─────────────────────────────────────────────────────────────────────────

RU_TERMS = """
## 1. Общие положения

1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует
отношения между {{COMPANY_NAME}} (далее — «Администрация») и физическим лицом
(далее — «Пользователь»), возникающие при использовании сервиса MyWay,
размещённого в сети Интернет по адресу mywayis.com и на поддоменах (далее — «Сервис»).

1.2. Регистрация в Сервисе означает полное и безоговорочное принятие условий
Соглашения. Если Пользователь не согласен с каким-либо условием, он обязан
воздержаться от использования Сервиса.

1.3. Администрация вправе изменять Соглашение. Новая редакция вступает в силу
с момента публикации, если в ней не указан иной срок. Существенные изменения
Администрация доводит до Пользователей по электронной почте не менее чем за
10 календарных дней.

## 2. Предмет соглашения

2.1. Сервис предоставляет Пользователю возможность:

- подключить внешние сервисы учёта рабочего времени и получать по ним аналитику;
- участвовать в сезонном рейтинге участников;
- обмениваться сообщениями с другими Пользователями;
- получать дополнительные функции в рамках платной подписки.

2.2. Сервис не является средством учёта рабочего времени для целей трудовых
отношений и не может использоваться работодателем для контроля работников
без их согласия.

## 3. Регистрация и учётная запись

3.1. Для использования Сервиса Пользователь создаёт учётную запись, указывая
адрес электронной почты, имя пользователя (username) и пароль.

3.2. Пользователь обязуется указывать достоверные данные и поддерживать их в
актуальном состоянии.

3.3. Пользователь самостоятельно отвечает за сохранность пароля и за все
действия, совершённые под его учётной записью. При подозрении на
несанкционированный доступ Пользователь обязан немедленно уведомить Администрацию.

3.4. Одному Пользователю соответствует одна учётная запись. Создание учётных
записей автоматизированными средствами не допускается.

3.5. Регистрация может быть временно приостановлена Администрацией. Это не
ограничивает права уже зарегистрированных Пользователей.

## 4. Использование Сервиса

4.1. Пользователь обязуется не совершать действий, которые:

- нарушают законодательство Российской Федерации;
- направлены на нарушение работоспособности Сервиса или обход его ограничений;
- связаны с рассылкой нежелательных сообщений другим Пользователям;
- вводят других Пользователей в заблуждение, в том числе путём искусственного
  завышения показателей в рейтинге.

4.2. Искусственная накрутка показателей (автоматизированная эмуляция активности
в редакторе, передача чужих данных) является основанием для исключения из
рейтинга и блокировки учётной записи.

4.3. Администрация вправе ограничить доступ к учётной записи при нарушении
Соглашения, уведомив Пользователя по электронной почте с указанием причины.

## 5. Интеллектуальная собственность

5.1. Исключительные права на Сервис, его дизайн, программный код и содержимое
принадлежат Администрации.

5.2. Пользователь сохраняет все права на данные, которые передаются в Сервис
из подключённых интеграций.

5.3. Пользователь предоставляет Администрации право обрабатывать эти данные
исключительно в объёме, необходимом для работы Сервиса: расчёта аналитики,
формирования рейтинга и подготовки отчётов.

## 6. Платные функции

6.1. Часть функций предоставляется по платной подписке. Состав, стоимость и
порядок оплаты определяются Публичной офертой и страницей тарифов.

6.2. Базовые функции Сервиса предоставляются бесплатно без ограничения срока.

## 7. Ответственность

7.1. Сервис предоставляется «как есть». Администрация не гарантирует, что
Сервис будет работать без перерывов и ошибок.

7.2. Администрация не несёт ответственности за решения, принятые Пользователем
на основании данных Сервиса, а также за недоступность или некорректность данных
внешних интеграций.

7.3. Ответственность Администрации по любым основаниям ограничена суммой,
уплаченной Пользователем за подписку за последние три месяца.

7.4. Ограничения ответственности не применяются к случаям, когда закон не
допускает такого ограничения.

## 8. Прекращение использования

8.1. Пользователь вправе в любой момент удалить учётную запись через настройки
Сервиса. Удаление необратимо и влечёт уничтожение статистики и переписки.

8.2. Администрация вправе прекратить оказание услуг при существенном нарушении
Соглашения, уведомив Пользователя.

## 9. Заключительные положения

9.1. К Соглашению применяется право Российской Федерации.

9.2. Споры разрешаются путём переговоров, а при недостижении согласия —
в суде по месту нахождения Администрации, с соблюдением обязательного
претензионного порядка. Срок ответа на претензию — 30 календарных дней.

9.3. Связь с Администрацией: {{CONTACT_EMAIL}}.
"""

RU_PRIVACY = """
## 1. Общие сведения

1.1. Настоящая Политика определяет порядок обработки и защиты персональных
данных Пользователей сервиса MyWay и разработана в соответствии с
Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».

1.2. Оператор персональных данных: {{COMPANY_NAME}}, адрес: {{COMPANY_ADDRESS}},
контакт: {{CONTACT_EMAIL}}.

1.3. Используя Сервис, Пользователь подтверждает согласие с настоящей Политикой.

## 2. Какие данные мы обрабатываем

2.1. **Данные, которые Пользователь указывает сам:**

| Данные | Назначение |
|---|---|
| Адрес электронной почты | Идентификация, вход, служебные уведомления |
| Имя пользователя (username) | Отображение в Сервисе и в рейтинге |
| Пароль | Хранится только в виде необратимого хеша |
| Специальность и её описание | Подбор тегов, фильтры рейтинга, профиль |
| Имя и фамилия | Необязательно, отображаются в профиле |
| Страна, город, часовой пояс | Корректное отображение времени и фильтры |

2.2. **Данные, получаемые из подключённых интеграций:** суммарное время
работы, языки программирования, названия проектов, распределение активности
по часам и дням.

2.3. **Технические данные:** сведения о сессии и языковых настройках,
хеш IP-адреса (сам адрес в открытом виде не сохраняется).

## 3. Чего мы НЕ обрабатываем

3.1. Сервис **не получает и не хранит**:

- содержимое исходного кода;
- имена и пути файлов;
- содержимое репозиториев;
- данные банковских карт — они обрабатываются платёжной организацией,
  на сторону Сервиса не передаются и не сохраняются.

## 4. Цели обработки

4.1. Обработка осуществляется для:

- предоставления доступа к Сервису и его функциям;
- расчёта персональной аналитики;
- формирования рейтинга участников — только для тех, кто дал согласие;
- обмена сообщениями между Пользователями;
- исполнения договора при платной подписке;
- ответов на обращения.

4.2. Данные не используются для рекламного профилирования и не передаются
третьим лицам в маркетинговых целях.

## 5. Правовые основания

5.1. Согласие субъекта персональных данных (ст. 6 ч. 1 п. 1 152-ФЗ) —
для регистрации, аналитики и участия в рейтинге.

5.2. Исполнение договора (ст. 6 ч. 1 п. 5 152-ФЗ) — для платной подписки.

5.3. Исполнение обязанностей, установленных законом, — для бухгалтерского
и налогового учёта.

## 6. Передача третьим лицам

6.1. Данные могут передаваться:

- поставщику услуг хостинга — для размещения Сервиса;
- платёжной организации — только сведения, необходимые для платежа;
- поставщику почтовой рассылки — адрес и текст служебного письма;
- государственным органам — по основаниям, предусмотренным законом.

6.2. Все данные Пользователей из Российской Федерации хранятся и
обрабатываются на серверах, расположенных на территории Российской Федерации
(ч. 5 ст. 18 152-ФЗ).

6.3. Трансграничная передача персональных данных не осуществляется.

## 7. Сроки хранения

7.1. Данные хранятся, пока существует учётная запись, и удаляются в течение
30 дней после её удаления.

7.2. Документы, для которых закон устанавливает срок хранения (платёжные),
хранятся в течение установленного срока.

## 8. Права Пользователя

8.1. Пользователь вправе:

- получить сведения об обрабатываемых данных;
- потребовать уточнения, блокирования или уничтожения данных;
- отозвать согласие на обработку;
- удалить учётную запись самостоятельно в настройках;
- обжаловать действия Оператора в Роскомнадзоре или в суде.

8.2. Запрос направляется на {{CONTACT_EMAIL}}. Срок ответа — 30 календарных дней.

8.3. Отзыв согласия влечёт прекращение оказания услуг: без обработки данных
Сервис работать не может.

## 9. Защита данных

9.1. Применяются организационные и технические меры: шифрование трафика (HTTPS),
хранение паролей в виде хеша, шифрование ключей доступа к интеграциям,
ограничение доступа сотрудников, журналирование доступа.

## 10. Изменения

10.1. Актуальная редакция всегда доступна на этой странице. При существенных
изменениях Пользователи уведомляются по электронной почте.
"""

RU_CONSENT = """
## Согласие на обработку персональных данных

Настоящим я, регистрируясь в сервисе MyWay, свободно, своей волей и в своём
интересе даю согласие {{COMPANY_NAME}} (далее — «Оператор»), адрес:
{{COMPANY_ADDRESS}}, на обработку моих персональных данных на условиях,
изложенных ниже.

### 1. Перечень персональных данных

- адрес электронной почты;
- имя пользователя (username);
- пароль в виде необратимого хеша;
- специальность и её описание;
- имя и фамилия (при добровольном указании);
- страна, город, часовой пояс;
- статистика рабочего времени, получаемая из подключённых интеграций:
  длительность, языки программирования, названия проектов, распределение
  активности по времени.

### 2. Перечень действий с данными

Сбор, запись, систематизация, накопление, хранение, уточнение (обновление,
изменение), извлечение, использование, обезличивание, блокирование, удаление
и уничтожение — как автоматизированным способом, так и без использования
средств автоматизации.

### 3. Цели обработки

- регистрация и предоставление доступа к Сервису;
- расчёт и отображение персональной аналитики;
- участие в рейтинге участников (только при отдельном согласии, которое
  даётся включением соответствующей настройки и в любой момент отзывается);
- обмен сообщениями с другими пользователями;
- информирование о работе Сервиса.

### 4. Срок действия согласия

Согласие действует со дня его предоставления до дня отзыва.

### 5. Порядок отзыва

Согласие отзывается направлением письменного уведомления на {{CONTACT_EMAIL}}
либо удалением учётной записи в настройках Сервиса. Оператор прекращает
обработку и уничтожает данные в течение 30 дней, за исключением данных,
хранение которых обязательно в силу закона.

### 6. Подтверждение

Я подтверждаю, что ознакомлен(а) с Политикой конфиденциальности, права и
обязанности в области защиты персональных данных мне разъяснены.
"""

RU_COOKIES = """
## 1. Что такое cookie

Cookie — небольшие текстовые файлы, которые сайт сохраняет в браузере. Они
позволяют запомнить настройки между визитами.

## 2. Какие cookie использует MyWay

| Назначение | Файл | Срок | Обязательный |
|---|---|---|---|
| Сессия и защита от CSRF | `sessionid`, `csrftoken` | Сессия / 1 год | Да |
| Выбранный язык интерфейса | `myway_language` | 1 год | Да |
| Выбранная тема оформления | Локальное хранилище | Бессрочно | Да |
| Отметка о прочтении этого уведомления | Локальное хранилище | Бессрочно | Да |

## 3. Чего мы не используем

На сайте **не установлены** рекламные и трекинговые системы, пиксели
социальных сетей и сторонние счётчики. Профилирование поведения посетителей
не ведётся.

Если в будущем аналитика будет подключена, уведомление на сайте изменится,
а согласие будет запрошено отдельно.

## 4. Управление cookie

4.1. Технические cookie необходимы для работы сайта: без них не сохранится
язык и не будет работать вход.

4.2. Удалить или заблокировать cookie можно в настройках браузера. При
блокировке часть функций перестанет работать.

## 5. Контакты

Вопросы по обработке cookie: {{CONTACT_EMAIL}}.
"""

RU_OFFER = """
## Публичная оферта на оказание услуг

{{COMPANY_NAME}} (далее — «Исполнитель») публикует настоящую оферту —
предложение заключить договор возмездного оказания услуг на изложенных
ниже условиях с любым физическим лицом (далее — «Заказчик»).

## 1. Предмет договора

1.1. Исполнитель предоставляет Заказчику доступ к расширенным функциям
сервиса MyWay в рамках тарифа Pro, а Заказчик оплачивает этот доступ.

1.2. Состав функций тарифа Pro опубликован на странице тарифов и является
неотъемлемой частью настоящей оферты.

## 2. Порядок заключения договора

2.1. Договор считается заключённым с момента оплаты (акцепт оферты).

2.2. Акцепт означает полное согласие Заказчика с условиями оферты и
Пользовательского соглашения.

## 3. Стоимость и порядок оплаты

3.1. Стоимость услуг указана на странице тарифов и включает все налоги.

3.2. Оплата производится в рублях Российской Федерации через платёжные
сервисы. Исполнитель не получает и не хранит данные банковских карт.

3.3. Периоды подписки: один месяц или один год. Годовой период оплачивается
единым платежом.

3.4. Подписка продлевается автоматически в конце оплаченного периода.
Автопродление отключается в настройках личного кабинета в любой момент.

3.5. Исполнитель вправе изменить стоимость. Изменение не затрагивает уже
оплаченный период; о новой стоимости Заказчик уведомляется не менее чем
за 14 календарных дней.

## 4. Срок оказания услуг

4.1. Услуги оказываются непрерывно в течение оплаченного периода с момента
поступления оплаты.

4.2. Услуга считается оказанной надлежащим образом и принятой Заказчиком,
если в течение оплаченного периода не поступило мотивированной претензии.

## 5. Права и обязанности

5.1. Исполнитель обязуется обеспечить доступность Сервиса и конфиденциальность
данных Заказчика.

5.2. Исполнитель вправе проводить плановые технические работы, уведомляя о
них заранее, если работы затрагивают доступность более чем на один час.

5.3. Заказчик обязуется не передавать доступ к учётной записи третьим лицам.

## 6. Возврат средств

6.1. Порядок и сроки возврата определяются Политикой возврата средств.

## 7. Ответственность

7.1. Стороны несут ответственность в соответствии с законодательством
Российской Федерации и Пользовательским соглашением.

7.2. Исполнитель не отвечает за перебои, вызванные действиями третьих лиц:
провайдеров связи, платёжных сервисов, внешних интеграций.

## 8. Реквизиты Исполнителя

{{COMPANY_NAME}}
ИНН: {{COMPANY_INN}}
ОГРНИП: {{COMPANY_OGRN}}
Адрес: {{COMPANY_ADDRESS}}
Электронная почта: {{CONTACT_EMAIL}}
"""

RU_REFUND = """
## 1. Общие условия

1.1. Настоящая Политика определяет порядок возврата денежных средств за
подписку на тариф Pro сервиса MyWay.

1.2. Политика составлена с учётом Закона РФ от 07.02.1992 № 2300-I
«О защите прав потребителей».

## 2. Право на отказ

2.1. Заказчик вправе отказаться от услуг в любой момент.

2.2. При отказе в течение **14 календарных дней** с даты первой оплаты
подписки денежные средства возвращаются в полном объёме, если за этот
период не использовались функции Pro более чем в течение трёх дней.

2.3. При отказе после 14 дней возвращается часть оплаты, пропорциональная
неиспользованному остатку оплаченного периода, за вычетом фактически
понесённых Исполнителем расходов.

2.4. При отказе от годовой подписки расчёт ведётся исходя из фактически
использованных полных месяцев по стоимости месячной подписки.

## 3. Порядок обращения

3.1. Заявление направляется на {{CONTACT_EMAIL}} с адреса электронной почты,
указанного в учётной записи, и содержит:

- имя пользователя (username);
- дату и сумму платежа;
- причину отказа (по желанию);
- реквизиты для возврата, если возврат на исходный способ оплаты невозможен.

3.2. Исполнитель рассматривает заявление в течение **10 календарных дней**.

3.3. Возврат производится тем же способом, которым была произведена оплата,
в срок **до 10 рабочих дней** с момента одобрения заявления. Фактическое
зачисление зависит от банка Заказчика.

## 4. Случаи, когда возврат не производится

4.1. Возврат не производится, если:

- учётная запись заблокирована за нарушение Пользовательского соглашения,
  в том числе за накрутку показателей;
- оплаченный период полностью истёк;
- заявление подано более чем через 6 месяцев после платежа.

## 5. Сбой в работе Сервиса

5.1. Если функции Pro были недоступны по вине Исполнителя более 24 часов
подряд, оплаченный период продлевается на срок недоступности либо, по выбору
Заказчика, возвращается пропорциональная часть оплаты.

## 6. Спорные ситуации

6.1. Все спорные ситуации рассматриваются индивидуально. Исполнитель
заинтересован в досудебном урегулировании и готов пойти навстречу, если
Заказчик остался недоволен услугой.
"""

RU_REQUISITES = """
## Сведения об исполнителе

| | |
|---|---|
| **Наименование** | {{COMPANY_NAME}} |
| **ИНН** | {{COMPANY_INN}} |
| **ОГРНИП / ОГРН** | {{COMPANY_OGRN}} |
| **Юридический адрес** | {{COMPANY_ADDRESS}} |
| **Электронная почта** | {{CONTACT_EMAIL}} |
| **Сайт** | mywayis.com |

## Информация о сервисе

**Название:** MyWay

**Назначение:** аналитика рабочего времени для IT-специалистов на основе
данных внешних сервисов учёта времени.

**Способы оплаты:** банковские карты платёжных систем «Мир», Visa,
Mastercard, а также Система быстрых платежей. Оплата проводится через
платёжный сервис; данные карт на стороне MyWay не сохраняются.

**Валюта расчётов:** российский рубль (RUB).

## Поддержка

Обращения принимаются по адресу {{CONTACT_EMAIL}} и через форму обратной
связи на сайте. Срок ответа — до 3 рабочих дней, по вопросам оплаты —
до 1 рабочего дня.
"""

# ─────────────────────────────────────────────────────────────────────────
#  Юрисдикция США
# ─────────────────────────────────────────────────────────────────────────

US_TERMS = """
## 1. Acceptance of Terms

1.1. These Terms of Service ("Terms") govern your access to and use of MyWay
(the "Service"), operated by {{COMPANY_NAME}} ("we", "us").

1.2. By creating an account you agree to these Terms. If you do not agree,
do not use the Service.

1.3. You must be at least 16 years old to use the Service.

## 2. The Service

2.1. MyWay connects to third-party time-tracking services, turns the data
into analytics, and offers an optional seasonal leaderboard and messaging
between members.

2.2. The Service is not designed for employer surveillance of employees and
may not be used for that purpose without the individual's informed consent.

## 3. Your Account

3.1. You provide an email address, a username and a password.

3.2. You are responsible for keeping your password confidential and for all
activity under your account. Notify us promptly of any unauthorized use.

3.3. One person, one account. Automated account creation is prohibited.

## 4. Acceptable Use

4.1. You agree not to:

- violate any applicable law;
- interfere with or disrupt the Service or circumvent its limits;
- send unsolicited messages to other members;
- artificially inflate leaderboard metrics through simulated activity or
  data belonging to another person.

4.2. Violations may result in removal from the leaderboard or suspension of
your account. See the Acceptable Use Policy for details.

## 5. Intellectual Property

5.1. We retain all rights in the Service, including its design and code.

5.2. You retain all rights in the data imported from your integrations.

5.3. You grant us a limited license to process that data solely to operate
the Service: computing analytics, ranking and generating reports.

## 6. Paid Plans

6.1. Certain features require a paid subscription. Pricing and included
features are described on the pricing page.

6.2. Core features are free with no time limit.

6.3. Subscriptions renew automatically until cancelled. You may cancel at any
time from your account settings.

## 7. Disclaimers

7.1. THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES
OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NON-INFRINGEMENT.

7.2. We do not warrant that the Service will be uninterrupted or error-free,
or that data from third-party integrations will be accurate.

## 8. Limitation of Liability

8.1. TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY ARISING OUT
OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE AMOUNTS YOU PAID US IN THE
THREE MONTHS PRECEDING THE CLAIM.

8.2. WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL
OR PUNITIVE DAMAGES, OR FOR LOST PROFITS OR DATA.

8.3. Some jurisdictions do not allow these exclusions; in that case they
apply to the fullest extent permitted.

## 9. Termination

9.1. You may delete your account at any time from settings. Deletion is
permanent and removes your statistics and messages.

9.2. We may suspend or terminate your account for material breach of these
Terms, with notice where practicable.

## 10. Changes

10.1. We may modify these Terms. Material changes will be announced by email
at least 10 days in advance.

## 11. Governing Law and Disputes

11.1. These Terms are governed by the laws of the State of Delaware, without
regard to conflict-of-law rules.

11.2. Before filing a claim, you agree to contact us at {{CONTACT_EMAIL}} and
attempt to resolve the dispute informally for at least 30 days.
"""

US_PRIVACY = """
## 1. Introduction

1.1. This Privacy Policy explains how {{COMPANY_NAME}} collects, uses and
shares personal information in connection with MyWay.

1.2. Contact: {{CONTACT_EMAIL}}, {{COMPANY_ADDRESS}}.

## 2. Information We Collect

2.1. **Information you provide:** email address, username, password (stored
only as an irreversible hash), specialty and its description, optional first
and last name, country, city and time zone.

2.2. **Information from integrations:** aggregate coding time, programming
languages, project names, and activity distribution by hour and day.

2.3. **Technical information:** session and language preferences, and a
hashed IP address. We do not store raw IP addresses.

## 3. What We Do Not Collect

We never receive or store your source code, file names, file paths or
repository contents. Payment card details are handled by our payment
processor and never reach our servers.

## 4. How We Use Information

- to provide and maintain the Service;
- to compute your personal analytics;
- to operate the leaderboard, only for members who opted in;
- to enable messaging between members;
- to process subscriptions and comply with tax obligations;
- to respond to your requests.

We do not sell personal information, and we do not use it for advertising
profiling or targeted advertising.

## 5. Legal Bases and Sharing

5.1. We share information only with: hosting providers, our payment
processor, our transactional email provider, and authorities where legally
required.

5.2. Each provider is bound by contractual confidentiality obligations.

## 6. Retention

6.1. We retain your information while your account exists and delete it
within 30 days of account deletion, except records we must keep for tax
and accounting purposes.

## 7. Your Rights

7.1. Depending on where you live, you may have the right to access, correct,
delete or export your personal information, and to opt out of the sale or
sharing of personal information.

7.2. **California residents (CCPA/CPRA).** You may request disclosure of the
categories and specific pieces of personal information collected, request
deletion, and request correction. We do not sell or share personal
information as those terms are defined by the CPRA, and we do not process
sensitive personal information for inferring characteristics. You will not
be discriminated against for exercising these rights.

7.3. To exercise any right, email {{CONTACT_EMAIL}}. We respond within 45
days and may extend once by another 45 days where permitted.

7.4. You may delete your account yourself at any time in settings.

## 8. Security

8.1. We use HTTPS in transit, store passwords as hashes, encrypt integration
API keys at rest, restrict employee access and log administrative actions.

8.2. No method of transmission or storage is completely secure; we cannot
guarantee absolute security.

## 9. Children

9.1. The Service is not directed to children under 16, and we do not
knowingly collect their personal information.

## 10. Changes

10.1. The current version is always available on this page. Material changes
will be communicated by email.
"""

US_COOKIES = """
## 1. What Cookies Are

Cookies are small text files stored by your browser. They let a site remember
your preferences between visits.

## 2. Cookies We Use

| Purpose | Name | Duration | Essential |
|---|---|---|---|
| Session and CSRF protection | `sessionid`, `csrftoken` | Session / 1 year | Yes |
| Interface language | `myway_language` | 1 year | Yes |
| Colour theme | Local storage | Persistent | Yes |
| Cookie notice dismissal | Local storage | Persistent | Yes |

## 3. What We Do Not Use

We do not run advertising networks, tracking pixels, social media widgets or
third-party analytics. We do not build behavioural profiles of visitors.

If analytics are added in the future, this page will be updated and consent
will be requested separately.

## 4. Managing Cookies

4.1. Essential cookies are required for the site to work: without them your
language preference will not persist and sign-in will fail.

4.2. You can delete or block cookies in your browser settings; some features
will stop working.

## 5. Contact

Questions about cookies: {{CONTACT_EMAIL}}.
"""

US_REFUND = """
## 1. Overview

1.1. This Refund Policy describes how refunds work for MyWay Pro subscriptions.

## 2. 14-Day Refund Window

2.1. If you are not satisfied, you may request a full refund within **14 days**
of your first Pro payment.

2.2. Refunds after the 14-day window are prorated for the unused portion of
the current billing period, at our discretion.

2.3. For annual plans, prorating is calculated using the monthly rate for
each full month already used.

## 3. How to Request

3.1. Email {{CONTACT_EMAIL}} from the address on your account, including:

- your username;
- the date and amount of the payment;
- the reason for the request (optional).

3.2. We review requests within **10 business days**.

3.3. Approved refunds are issued to the original payment method within
**10 business days**. Posting time depends on your bank.

## 4. Exceptions

4.1. Refunds are not issued where:

- the account was suspended for violating the Terms of Service, including
  artificial inflation of metrics;
- the billing period has fully elapsed;
- the request is made more than 6 months after payment.

## 5. Service Outages

5.1. If Pro features are unavailable due to our fault for more than 24
consecutive hours, we extend your paid period by the outage duration or, at
your choice, refund the corresponding portion.

## 6. Cancellation

6.1. Cancelling a subscription stops future renewals. Access to Pro continues
until the end of the paid period. Cancellation alone does not trigger a refund.
"""

US_AUP = """
## 1. Purpose

This Acceptable Use Policy describes conduct that is prohibited on MyWay. It
supplements the Terms of Service.

## 2. Prohibited Conduct

2.1. **Metric manipulation.** Do not simulate editor activity, submit data
generated by scripts, or import statistics belonging to another person in
order to affect your leaderboard position.

2.2. **Abuse of other members.** Do not send unsolicited commercial messages,
harass, threaten or impersonate other members.

2.3. **Technical abuse.** Do not attempt to gain unauthorized access, probe
for vulnerabilities without permission, circumvent rate limits, or interfere
with the availability of the Service.

2.4. **Unlawful content.** Do not use messaging or profile fields to
distribute unlawful content or infringe intellectual property rights.

2.5. **Account sharing.** Do not share credentials or resell access.

## 3. Reporting

3.1. Report violations to {{CONTACT_EMAIL}} or through the in-app report
action. Include the username and, where relevant, screenshots.

## 4. Enforcement

4.1. Depending on severity we may: issue a warning, remove content, remove
the account from the leaderboard, suspend the account, or terminate it.

4.2. We aim to notify the account holder of the reason, except where notice
would impede an investigation or is prohibited by law.

4.3. To appeal an enforcement action, email {{CONTACT_EMAIL}} within 30 days.

## 5. Security Research

5.1. Good-faith security research is welcome. Contact us before testing,
avoid accessing other users' data, and give us reasonable time to fix an
issue before disclosure. We will not pursue action against researchers who
follow these rules.
"""

US_DMCA = """
## 1. Copyright Policy

We respect intellectual property rights and respond to clear notices of
alleged copyright infringement under the Digital Millennium Copyright Act.

## 2. Filing a Notice

2.1. Send written notice to {{CONTACT_EMAIL}} with the subject line
"DMCA Notice", including:

1. a physical or electronic signature of the copyright owner or an authorized
   agent;
2. identification of the copyrighted work claimed to be infringed;
3. identification of the material claimed to be infringing and information
   reasonably sufficient to locate it;
4. your contact information;
5. a statement that you have a good-faith belief that the use is not
   authorized by the copyright owner, its agent, or the law;
6. a statement, under penalty of perjury, that the information is accurate
   and that you are authorized to act on the owner's behalf.

2.2. Incomplete notices may not be actionable.

## 3. Our Response

3.1. On receiving a valid notice we will remove or disable access to the
material and notify the member who posted it.

## 4. Counter-Notice

4.1. If you believe material was removed in error, send a counter-notice to
{{CONTACT_EMAIL}} containing:

1. your signature;
2. identification of the removed material and its former location;
3. a statement under penalty of perjury that you have a good-faith belief the
   removal resulted from mistake or misidentification;
4. your name, address and telephone number, and consent to the jurisdiction
   of the federal court for your district.

4.2. We may restore the material in 10 to 14 business days unless the
original complainant notifies us that they have filed a court action.

## 5. Repeat Infringers

5.1. Accounts of repeat infringers are terminated in appropriate circumstances.

## 6. Misrepresentation

6.1. Under 17 U.S.C. § 512(f), knowingly misrepresenting that material is
infringing may result in liability for damages.
"""


def _document(
    slug: str,
    jurisdiction: str,
    language: str,
    title: str,
    summary: str,
    body: str,
    order: int,
    show_in_footer: bool = False,
) -> dict:
    return {
        "slug": slug,
        "jurisdiction": jurisdiction,
        "language": language,
        "title": title,
        "summary": summary,
        "body": body.strip(),
        "version": "1.0",
        "effective_date": EFFECTIVE_DATE,
        "is_published": True,
        "show_in_footer": show_in_footer,
        "order": order,
    }


DOCUMENTS = [
    # — Россия —
    _document(
        "terms", "RU", "ru",
        "Пользовательское соглашение",
        "Условия использования сервиса, права и обязанности сторон.",
        RU_TERMS, 10, show_in_footer=True,
    ),
    _document(
        "privacy", "RU", "ru",
        "Политика конфиденциальности",
        "Какие данные мы обрабатываем, зачем и как их защищаем. Составлена по 152-ФЗ.",
        RU_PRIVACY, 20, show_in_footer=True,
    ),
    _document(
        "consent", "RU", "ru",
        "Согласие на обработку персональных данных",
        "Текст согласия, которое даётся при регистрации.",
        RU_CONSENT, 30,
    ),
    _document(
        "cookies", "RU", "ru",
        "Политика в отношении файлов cookie",
        "Какие cookie используются и как ими управлять.",
        RU_COOKIES, 40, show_in_footer=True,
    ),
    _document(
        "offer", "RU", "ru",
        "Публичная оферта",
        "Условия договора на оказание платных услуг тарифа Pro.",
        RU_OFFER, 50, show_in_footer=True,
    ),
    _document(
        "refund", "RU", "ru",
        "Политика возврата средств",
        "Когда и как можно вернуть оплату за подписку.",
        RU_REFUND, 60,
    ),
    _document(
        "requisites", "RU", "ru",
        "Реквизиты",
        "Сведения об исполнителе, способы оплаты и контакты поддержки.",
        RU_REQUISITES, 70,
    ),

    # — США —
    _document(
        "terms", "US", "en",
        "Terms of Service",
        "The rules for using MyWay and the rights of both sides.",
        US_TERMS, 10, show_in_footer=True,
    ),
    _document(
        "privacy", "US", "en",
        "Privacy Policy",
        "What we collect, why, and the rights you have over your data.",
        US_PRIVACY, 20, show_in_footer=True,
    ),
    _document(
        "cookies", "US", "en",
        "Cookie Policy",
        "Which cookies we set and how to control them.",
        US_COOKIES, 30, show_in_footer=True,
    ),
    _document(
        "refund", "US", "en",
        "Refund Policy",
        "How refunds work for Pro subscriptions.",
        US_REFUND, 40, show_in_footer=True,
    ),
    _document(
        "aup", "US", "en",
        "Acceptable Use Policy",
        "Conduct that is not allowed on MyWay and how we enforce it.",
        US_AUP, 50,
    ),
    _document(
        "dmca", "US", "en",
        "DMCA / Copyright Policy",
        "How to file a copyright notice and a counter-notice.",
        US_DMCA, 60,
    ),
]
