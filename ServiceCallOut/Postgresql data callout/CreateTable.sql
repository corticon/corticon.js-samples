--  Create the database
CREATE DATABASE fleet;

--  Connect to the database (you might need to do this separately depending on your client)
\c fleet;

--  Create the Driver table
CREATE TABLE "public"."Driver" (
    "licenseNo" VARCHAR NULL,
    "last" VARCHAR NULL,
    "gender" VARCHAR NULL,
    "email" VARCHAR NULL,
    "first" VARCHAR NULL,
    "phone" VARCHAR NULL,
    "dutyStatus" VARCHAR NULL
);

--  Insert data into the Driver table
INSERT INTO "public"."Driver" ("licenseNo", "last", "gender", "email", "first", "phone", "dutyStatus") VALUES
('123008987', 'Metherell', 'Male', 'mmetherelli@netlog.com', 'Matthaeus', '597-154-1615', 'Off Duty'),
('189213454', 'Deam', 'Female', 'sdeam9@kickstarter.com', 'Sybil', '754-560-0239', 'On Duty Not Driving'),
('200797593', 'Castanyer', 'Female', 'mcastanyero@eventbrite.com', 'Marty', '212-675-8442', 'Sleeper Berth'),
('226521813', 'Torricella', 'Female', 'ktorricella7@nature.com', 'Kiley', '641-521-7938', 'Driving'),
('243915082', 'Breston', 'Female', 'sbreston4@acquirethisname.com', 'Starr', '366-437-1343', 'Off Duty'),
('248376358', 'Struss', 'Non-binary', 'gstruss0@sogou.com', 'Giles', '477-344-6187', 'On Duty Not Driving'),
('273112539', 'Muckloe', 'Male', 'jmuckloe6@booking.com', 'Jeth', '792-713-4169', 'Sleeper Berth'),
('309414340', 'Kydde', 'Male', 'akyddeg@trellian.com', 'Aubrey', '399-381-5691', 'Driving'),
('380599674', 'Pawnsford', 'Male', 'cpawnsfordr@webnode.com', 'Charlton', '708-370-6009', 'Off Duty'),
('428196094', 'Boays', 'Female', 'eboays2@amazonaws.com', 'Ellyn', '975-729-7238', 'On Duty Not Driving'),
('432675264', 'Fever', 'Male', 'tfeverj@rediff.com', 'Terence', '368-766-1025', 'Sleeper Berth'),
('504428610', 'Mowat', 'Male', 'rmowatq@smh.com.au', 'Raymond', '626-213-7974', 'Driving'),
('507770065', 'Gillogley', 'Female', 'lgillogleyp@homestead.com', 'Lorry', '982-699-4829', 'Off Duty'),
('532084630', 'Verheyden', 'Male', 'kverheyden8@stumbleupon.com', 'Kalvin', '184-887-2443', 'On Duty Not Driving'),
('584928164', 'Loughman', 'Male', 'lloughman1@narod.ru', 'Llywellyn', '650-127-1224', 'Sleeper Berth'),
('587327956', 'Ewols', 'Male', 'jewolss@vimeo.com', 'Jerry', '149-926-8758', 'Driving'),
('646133809', 'Jansen', 'Female', 'ojansenf@europa.eu', 'Otha', '542-722-2272', 'Off Duty'),
('647944454', 'Biasi', 'Male', 'fbiasid@wikispaces.com', 'Fowler', '692-335-6452', 'On Duty Not Driving'),
('689955738', 'Levane', 'Female', 'wlevane5@skyrock.com', 'Winne', '808-768-2837', 'Sleeper Berth'),
('694530310', 'Haselup', 'Male', 'ohaselupc@tiny.cc', 'Oates', '726-983-7018', 'Driving'),
('727021130', 'Stoffers', 'Male', 'fstoffersn@nbcnews.com', 'Fitz', '636-784-9357', 'Off Duty'),
('742866781', 'Munn', 'Male', 'dmunnh@yale.edu', 'Decca', '542-115-0210', 'On Duty Not Driving'),
('753678726', 'Gager', 'Female', 'cgagere@google.com.au', 'Cathee', '726-147-3997', 'Sleeper Berth'),
('826315579', 'Sowle', 'Female', 'csowlel@bbb.org', 'Christabel', '946-842-1436', 'Driving'),
('838644173', 'Pelerin', 'Female', 'epelerink@creativecommons.org', 'Ethelda', '556-237-2151', 'Off Duty'),
('862554148', 'Calow', 'Genderfluid', 'dcalowb@fotki.com', 'Dorothee', '775-756-1825', 'On Duty Not Driving'),
('874383008', 'Georg', 'Male', 'rgeorgt@ocn.ne.jp', 'Rorke', '243-109-1836', 'Sleeper Berth'),
('977314825', 'Sanbroke', 'Female', 'gsanbrokea@surveymonkey.com', 'Giralda', '636-922-0741', 'Driving'),
('982908939', 'Mungham', 'Male', 'cmungham3@weibo.com', 'Chet', '856-272-5927', 'Off Duty'),
('995230881', 'Clapson', 'Male', 'cclapsonm@rediff.com', 'Creigh', '425-452-0945', 'On Duty Not Driving');