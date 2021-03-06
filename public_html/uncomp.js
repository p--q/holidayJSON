    // holidayJSONモジュール
    var holidayJSON =  holidayJSON || function() {
        var hj = {
            getJSON: function() {  // 祝日JSONデータの作成。
                var startY = parseInt(document.getElementById("startY").value);  // 開始年を取得。
                var endY = parseInt(document.getElementById("endY").value);  // 終了年を取得。
                g.dic = {};  // 辞書を初期化。
                for(var y=startY;y<=endY;y++) {  // 各年について
                    g.dic[y] = [];  // 辞書の値を配列にする。
                    for(var m=0;m<12;m++) {  // 各月について
                        var r = hdayjp.calculate(y,m);  // 祝日オブジェクトの配列を取得。祝日オブジェクトのmdプロパティに日付が入っている。
                        var h = [];  // 祝日の日付をいれる配列。
                        r.forEach(function(e){
                            h.push(e.md);  // 祝日オブジェクトのmdプロパティから日付一覧を取得。
                        });
                        g.dic[y].push(h);  // 辞書の値の配列の要素に祝日の日付を追加。
                    }
                    if (y==2017) {  // 2017/1/2の振替休日修正分
                        g.dic[y][0].push(2);
                        g.dic[y][0] = Array.from(new Set(g.dic[y][0])).sort(function(a,b) {  // 重複要素を削除して昇順に並び替える。
                            return (a < b ? -1 : 1);
                        });
                    }  
                }
                var json = JSON.stringify(g.dic);  // 辞書をJSON文字列に変換。
                document.holiday.msg.value = json;  // 変換したJSON文字列をテキストエリアに表示。
                count();
            },
            clpCopy: function() {  // テキストエリアをクリップボードにコピーする。iOSでは不能。
                var txt = document.getElementById("msg");
                txt.select();
                document.execCommand("copy");
            },
            emptyJSON: function() {  // 空JSONデータの作成。
                var startY = parseInt(document.getElementById("startY").value);  // 開始年を取得。
                var endY = parseInt(document.getElementById("endY").value);  // 終了年を取得。
                g.dic = {};  // 辞書を初期化。
                for(var y=startY;y<=endY;y++) {  // 各年について
                    g.dic[y] = [];  // 辞書の値を配列にする。
                    for(var m=0;m<12;m++) {  // 各月について
                        g.dic[y][m] = [];
                    }
                }
                var json = JSON.stringify(g.dic);  // 辞書をJSON文字列に変換。
                document.holiday.msg.value = json;  // 変換したJSON文字列をテキストエリアに表示。
                count();
            },
            addDate: function() {
                var startC,startY,startM,startD,endC,endY,endM,endD,arrR,y,m,d;  // ローカル変数
                g.dic = JSON.parse(document.getElementById("msg").value);  // 祝日JSONを取得。
                var keys = Object.keys(g.dic);  // 祝日JSONのkeyの配列を得る。
                g.sY = Math.min.apply(null, keys);  // 祝日JSONの開始年の取得。
                g.eY = Math.max.apply(null, keys);  // 祝日JSONの終了年の取得。
                document.getElementById("added").value.split(",").forEach(function(e) {  // 各休日条件について 
                    e = e.trim();  // 要素の前後の空白を削除。
                    if (e.indexOf("-")!=-1) {  // 区間指定のとき
                        var arrC = e.split("-");  // 区間条件を配列に変換
                        startC = arrC[0].trim();  // 開始条件の取得
                        endC = arrC[1].trim();  // 終了条件の取得
                        switch (true) {
                            case g.reD.test(startC):  // 日-日のとき。毎月の繰り返し。
                                startD = parseInt(g.reD.exec(startC)[1]);  // 開始日の取得。
                                arrR = g.reD.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                endD = parseInt(arrR[3]);  // 終了日の取得。
                                for (y=g.sY;y<=g.eY;y++) {  // すべての年について
                                    for (m=0;m<=11;m++) {  // すべての月に対して
                                        mm(y,m,m,startD,endD,arrR[4]);  //  月指定のあるときの処理
                                    }
                                }
                                break;
                            case g.reM.test(startC):  // 月日-月日、月日-日のとき。毎年の繰り返し。
                                arrR = g.reM.exec(startC);  // 開始の正規表現の結果の配列を取得。
                                startM = parseInt(arrR[2]) - 1;  // 開始月を取得
                                startD = parseInt(arrR[3]);  // 開始日の取得
                                if (g.reD.test(endC)) {  // 月日-日のとき
                                    arrR = g.reD.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                    endM = startM;  // 終了月を取得
                                    endD = parseInt(arrR[3]);  // 終了日の取得
                                } else if (g.reM.test(endC)) {  // 月日-月日のとき
                                    arrR = g.reM.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                    endM= parseInt(arrR[2]) - 1;  // 終了月を取得
                                    endD = parseInt(arrR[3]);  // 終了日の取得
                                }
                                for (y=g.sY;y<=g.eY;y++) {  // すべての年について
                                    mm(y,startM,endM,startD,endD,arrR[4]);  //  月指定のあるときの処理
                                }
                                break;
                            case g.reY.test(startC):  // 年月日-年月日、年月日-月日、年月日-日、のとき。1回のみ。
                                arrR = g.reY.exec(startC);  // 開始の正規表現の結果の配列を取得。
                                startY = parseInt(arrR[1]);  // 開始年を収得。
                                startM = parseInt(arrR[2]) - 1;  // 開始月を取得
                                startD = parseInt(arrR[3]);  // 開始日の取得
                                if (g.reY.test(endC)) {  // 年月日-年月日のとき
                                    arrR = g.reY.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                    endY = parseInt(arrR[1]);  // 終了年を収得。
                                    endM = parseInt(arrR[2]) - 1;  // 終了月を取得
                                    endD = parseInt(arrR[3]);  // 終了日の取得
                                } else if (g.reM.test(endC)) {  // 年月日-月日のとき
                                    arrR = g.reM.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                    endY = startY;  // 終了年を収得。
                                    endM = parseInt(arrR[2]) - 1;  // 終了月を取得
                                    endD = parseInt(arrR[3]);  // 終了日の取得
                                } else if (g.reD.test(endC)) {  // 年月日-日のとき
                                    arrR = g.reD.exec(endC);  // 終了の正規表現の結果の配列を取得。
                                    endY = startY;  // 終了年を収得。
                                    endM = startM;  // 終了月を取得
                                    endD = parseInt(arrR[3]);  // 終了日の取得。
                                } 
                                if (startY==endY) {  // 開始年と終了年が同じとき
                                    mm(startY,startM,endM,startD,endD,arrR[4]);  //  月指定のあるときの処理  
                                } else if (startY<endY) {  // 開始年<終了年のとき
                                    for (var y=startY;y<=endY;y++){  // 開始年から終了年まで。
                                        if (y==startY) {  // 開始年のとき
                                            mm(y,startM,11,startD,31,arrR[4]);  //  月指定のあるときの処理。年末まで。
                                        } else if (y==endY) {  // 終了年のとき
                                            mm(y,0,endM,1,endD,arrR[4]);  //  月指定のあるときの処理。年始から。
                                        } else {  // 開始年でも終了年でもないとき
                                            mm(y,0,11,1,31,arrR[4]);  //  月指定のあるときの処理。年始から年末まで。
                                        }  
                                    }
                                }
                                break;
                        }
                    } else if (e.toUpperCase() in g.daydic) { // 曜日指定のとき
                        for (y=g.sY;y<=g.eY;y++) {  // すべての年について
                            for (var m=0;m<12;m++) {  // すべての月に対して
                                mm(y,m,m,1,31,e);  //  月指定のあるときの処理
                           }
                       }
                    } else {  // 区間指定以外のとき
                        switch (true) {
                            case g.reD.test(e):  // 日を指定
                                arrR = g.reD.exec(e);  // 正規表現の結果の配列を取得。
                                d = parseInt(arrR[3]);  // 日の収得。
                                for (y=g.sY;y<=g.eY;y++) {  // すべての年について
                                    for (m=0;m<=11;m++) {  // すべての月に対して     
                                        mm(y,m,m,d,d,arrR[4]);  //  月指定のあるときの処理
                                    }
                                }
                                break;
                            case g.reM.test(e):  // 月日を指定
                                arrR = g.reM.exec(e);  // 正規表現の結果の配列を取得。
                                m = parseInt(arrR[2]) - 1;  // 月の収得。
                                d = parseInt(arrR[3]);  // 日の収得。
                                for (y=g.sY;y<=g.eY;y++) {  // すべての年について
                                    mm(y,m,m,d,d,arrR[4]);  //  月指定のあるときの処理
                                }
                                break;
                            case g.reY.test(e):  // 年月日を指定
                                arrR = g.reY.exec(e);  // 正規表現の結果の配列を取得。
                                y = parseInt(arrR[1]);  // 年の収得。
                                m = parseInt(arrR[2]) - 1;  // 月の収得。
                                d = parseInt(arrR[3]);  // 日の収得。
                                mm(y,m,m,d,d,arrR[4]);  //  月指定のあるときの処理
                                break;
                        }
                    }
                });
                var json = JSON.stringify(g.dic);  // 辞書をJSON文字列に変換。
                document.holiday.msg.value = json;  // 変換したJSON文字列をテキストエリアに表示。
                count();
            }
        };  // end of hj
        var g = { // モジュール内の"グローバル"変数。
            daydic: {"SUN":0,"MON":1,"TUE":2,"WED":3,"THU":4,"FRI":5,"SAT":6},  // 曜日の辞書。
            reD: /^()()([1-3]*\d)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)*$/i,  // 日指定の正規表現パターン。
            reM: /^()([1]*\d)\/([1-3]*\d)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)*$/i,  // 月日指定の正規表現パターン。
            reY: /^(\d\d\d\d)\/([1]*\d)\/([1-3]*\d)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)*$/i,  // 年月日指定の正規表現パターン。
            dic: {},  // 祝日JSONの辞書。
            sY: null,  // 祝日JSONの開始年。
            eY: null  // 祝日JSONの終了年
        }; // end of g
        function mm(y,startM,endM,startD,endD,daystr) {  //  月指定のあるときの処理
            var d,edate,dt;  // ローカル変数。
            if (y>=g.sY&&y<=g.eY) {  // JSONにすでにある年のみ処理。
                for (var m=startM;m<=endM;m++) {  // 開始月から終了月まで。
                    var sD = startD;  // 開始日
                    var eD = endD;  // 終了日
                    if (m==startM && m!=endM) {  // 開始月、かつ、終了月でない、のとき
                        eD = 31;
                    } else if (m!=startM && m==endM) {  // 開始月でない、かつ、終了月、のとき
                        sD = 1;
                    } else if (m!=startM && m!=endM) {  // 開始月でない、かつ、終了月でない、のとき
                        sD = 1;
                        eD =  31;
                    }
                    var h = g.dic[y][m];  // 指定年月の祝日の配列を収得。
                    sD = (sD<1)?1:sD;  // 開始日を1以上に限定。
                    edate =  new Date(y, m+1, 0).getDate();  // 月末日を収得。
                    eD = (eD>edate)?edate:eD;  // 終了日は月末以下に限定。
                    for (d=sD;d<=eD;d++) {  // 開始日から終了日まで。
                        if (daystr) {  // 曜日指定があるとき。
                            dt = new Date(y, m, d);  // Dateオブジェクトを収得。
                            if (dt.getDay()==g.daydic[daystr.toUpperCase()]) {  // 曜日判定
                                h.push(d);  // 新しい休日を配列に追加
                                d += 6;  // 次週にとぶ
                            } 
                        } else {
                            h.push(d);  // 新しい休日を配列に追加
                        }
                    }
                    g.dic[y][m] = Array.from(new Set(h)).sort(function(a,b) {  // 重複要素を削除して昇順に並び替える。
                        return (a < b ? -1 : 1);
                    });  
                } 
            } 
        }  
        function count() {  // 日の数を数える。
            var c = 0;
            for (var y in g.dic) {
                for (var m=0;m<12;m++) {
                    c += g.dic[y][m].length;
                }
            } 
            document.getElementById("date_count").textContent = "合計日数: " + c;
        }
        {  // 単にIDEで折りたたむだけのカッコ。JavaScriptはグローバルスコープと関数スコープしかない。
            var hdayjp = {};
        // Copyright (c) 2014, boiledorange73
        // hdayjp 2014-12-20
        //if( !window.hdayjp ) {
        //  window.hdayjp = {};
        //}

        // resources
        hdayjp._resources = {
          "NYD": {"C": "New Year\'s Day", "ja": "元日", "ja_kana": "がんじつ"},
          "CAD": {"C": "Caming-of-Age Day", "ja": "成人の日", "ja_kana": "せいじんのひ"},
          "EBD": {"C": "The  Emperor\'s Birthday", "ja": "天皇誕生日", "ja_kana": "てんのうたんじょうび"},
          "CTD": {"C": "Constitution Day", "ja": "憲法記念日", "ja_kana": "けんぽうきねんび"},
          "CDD": {"C": "Children\'s Day", "ja": "こどもの日", "ja_kana": "こどものひ"},
          "CLD": {"C": "Culture Day", "ja": "文化の日", "ja_kana": "ぶんかのひ"},
          "LTD": {"C": "Labor Thanksgiving Day", "ja": "勤労感謝の日", "ja_kana": "きんろうかんしゃのひ"},
          "NFD": {"C": "National Foundation Day", "ja": "建国記念の日", "ja_kana": "けんこくきねんのひ"},
          "RAD": {"C": "Respect-for-the-Aged Day", "ja": "敬老の日", "ja_kana": "けいろうのひ"},
          "HSD": {"C": "Health and Sports Day", "ja": "体育の日", "ja_kana": "たいいくのひ"},
          "GRD": {"C": "Greenery Day", "ja": "みどりの日", "ja_kana": "みどりのひ"},
          "MRD": {"C": "Marine Day", "ja": "海の日", "ja_kana": "うみのひ"},
          "SWD": {"C": "Showa Day", "ja": "昭和の日", "ja_kana": "しょうわのひ"},
          "MTD": {"C": "Mountain Day", "ja": "山の日", "ja_kana": "やまのひ"},
          // Insert here if any holiday is added.
          "VED": {"C": "Vernal Equinox Day", "ja": "春分の日", "ja_kana": "しゅんぶんのひ"},
          "AED": {"C": "Autumn Equinox Day", "ja": "秋分の日", "ja_kana": "しゅうぶんのひ"},
          "NH": {"C": "National Holidy", "ja": "国民の休日", "ja_kana": "こくみんのきゅうじつ"},
          "HL": {"C": "A holiday in lieu", "ja": "振替休日", "ja_kana": "ふりかえきゅうじつ"},
          "NY": {"C": "New Year\'s Holiday", "ja": "年末年始", "ja_kana": "ねんまつねんし"}
        };

        // Locale. Only "ja" or "C" is avialable.
        hdayjp._lc = "ja";

        // ================================================
        // Result Class
        // ================================================
        // --------------------------------
        // Constructor
        // Arguments:
        //  id: id (2 or 3 characters) indicating each holiday.
        //  md: Day of month. Starts with 1.
        // --------------------------------
        hdayjp.Result = function(id, md) {
          this.id = id;
          this.md = md;
        };

        // --------------------------------
        //  Calculates name of the holiday.
        //  If argument lc is null or not specified, this sets lc with hdayjp._lc.
        //  If hdayjp._resources[this.id] does not contain the words which lc points,
        //    this assumes lc is "C".
        //  If hdayjp._resources[this.id] does not contain the words which "C" points,
        //    this returns only id (2 or 3 characters text).
        //  Arguments:
        //    lc: Locale text. Currently, "C", "ja" or "ja_kana" is available.
        //  Returned Value:
        //    Name of the holiday, or id (2 or 3 characters text).
        // --------------------------------
        hdayjp.Result.prototype.getText = function(lc) {
          if( this.id == null ) {
            return null;
          }
          var r = hdayjp._resources[this.id];
          if( r != null ) {
            if( r[lc] != null ) {
              return r[lc];
            }
            if( r[hdayjp._lc] != null ) {
              return r[hdayjp._lc];
            }
            if( r["C"] != null ) {
              return r["C"];
            }
          }
          return this.id;
        };

        // ================================================
        //  Entry Class
        // ================================================
        // --------------------------------
        //  Constructor.
        //  Arguments:
        //    id: id (2 or 3 characters) indicating each holiday.
        //    ystart: Start year for this holiday.
        //    yend: Endyear for this holiday. If this entry currentry is avaiable, set this with null.
        //    m: Month code. starting with 0 (0=Jan, ... 11=Dec).
        // --------------------------------
        hdayjp.Entry = function(id, ystart, yend, m) {
          this.id = id;
          this.ystart = ystart;
          this.yend = yend;
          this.m = m;
        };

        // --------------------------------
        //  Calculates whether this entry is avaiable in specified year and month.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    Whether this entry is available in specified year and month.
        // --------------------------------
        hdayjp.Entry.prototype.hit = function(y, m) {
          return m == this.m && (
              (this.ystart == null || y >= this.ystart) &&
              (this.yend == null || y <= this.yend)
            );
        };

        // --------------------------------
        //  Calculates the Day of month when this entry affects.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    Always returns null.
        // --------------------------------
        hdayjp.Entry.prototype.calc = function(y, m) {
          return null;
        };

        // ================================================
        //  FixedEntry Class
        //    Entry for fixed day of month.
        // ================================================
        // --------------------------------
        //  Constructor.
        //  Arguments:
        //    id: id (2 or 3 characters) indicating each holiday.
        //    ystart: Start year for this holiday.
        //    yend: Endyear for this holiday. If this entry currentry is avaiable, set this with null.
        //    m: Month code. starting with 0 (0=Jan, ... 11=Dec).
        //    md: Day of month.
        // --------------------------------
        hdayjp.FixedEntry = function(id, ystart, yend, m, md) {
          hdayjp.Entry.call(this, id, ystart, yend, m);
          this.md = md;
        };

        hdayjp.FixedEntry.prototype = new hdayjp.Entry();

        // --------------------------------
        //  Calculates the Day of month when this entry affects.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    The day of month.
        // --------------------------------
        hdayjp.FixedEntry.prototype.calc = function(y, m) {
          var id = this["id"];
          return new hdayjp.Result(id, this["md"]);
        };

        // ================================================
        //  WdayEntry Class
        //    Entry for fixed day of month.
        // ================================================
        // --------------------------------
        //  Constructor.
        //  Arguments:
        //    id: id (2 or 3 characters) indicating each holiday.
        //    ystart: Start year for this holiday.
        //    yend: Endyear for this holiday. If this entry currentry is avaiable, set this with null.
        //    m: Month code. starting with 0 (0=Jan, ... 11=Dec).
        //    week: Week
        //    wday: Weekday. Starting with 0 (0=Sun, ... 6=Sat).
        // --------------------------------
        hdayjp.WdayEntry = function(id, ystart, yend, m, week, wday) {
          hdayjp.Entry.call(this, id, ystart, yend, m);
          this.week = week;
          this.wday = wday;
        };

        hdayjp.WdayEntry.prototype = new hdayjp.Entry();

        // --------------------------------
        //  Calculates the Day of month when this entry affects.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    The day of month.
        // --------------------------------
        hdayjp.WdayEntry.prototype.calc = function(y, m) {
          var id = this["id"];
          var fwd = hdayjp.calcFirstWday(y, m);
          var d = this["week"] * 7 + (7 + this["wday"] - fwd) % 7 - 6;
          return new hdayjp.Result(id, d);
        };

        // ================================================
        //  VernalEquinoxEntry Class
        //    Entry for vernal equinox (unfixed mday on March)
        // ================================================
        // --------------------------------
        //  Constructor.
        //  Arguments:
        //    ystart: Start year for this holiday.
        //    yend: Endyear for this holiday. If this entry currentry is avaiable, set this with null.
        // --------------------------------
        hdayjp.VernalEquinoxEntry = function(ystart, yend) {
          hdayjp.Entry.call(this, "VED", ystart, yend, 2);
        };
        hdayjp.VernalEquinoxEntry.prototype = new hdayjp.Entry();

        // --------------------------------
        //  Calculates the Day of month when this entry affects.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    The day of month.
        // --------------------------------
        hdayjp.VernalEquinoxEntry.prototype.calc = function(y, m) {
          var id = this["id"];
          var d;
          if( y < 1980 ) {
            // http://www.asahi-net.or.jp/~ci5m-nmr/misc/equinox.html
            // 20 - 1960, 1964, 1968, 1972, 1976
            // 21 - others
            d = (y >= 1960 && y % 4 == 0) ? 20 : 21;
          }
          else {
            // http://oshiete.goo.ne.jp/qa/1454974.html
            d = parseInt(20.8431 + 0.242194 * ( y - 1980)) - parseInt((y - 1980)/4);
          }
          return new hdayjp.Result(id, d);
        };

        // ================================================
        //  AutumnEquinoxEntry Class
        //    Entry for autumn equinox (unfixed mday on September)
        // ================================================
        // --------------------------------
        //  Constructor.
        //  Arguments:
        //    ystart: Start year for this holiday.
        //    yend: Endyear for this holiday. If this entry currentry is avaiable, set this with null.
        // --------------------------------
        hdayjp.AutumnEquinoxEntry = function(ystart, yend) {
          hdayjp.Entry.call(this, "AED", ystart, yend, 8);
        };
        hdayjp.AutumnEquinoxEntry.prototype = new hdayjp.Entry();

        // --------------------------------
        //  Calculates the Day of month when this entry affects.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    The day of month.
        // --------------------------------
        hdayjp.AutumnEquinoxEntry.prototype.calc = function(y, m) {
          var id = this["id"];
          var d;
          // 2014-12-10 - 1948-1980 added. (issue #2)
          if( y < 1980 ) {
            // http://www.asahi-net.or.jp/~ci5m-nmr/misc/equinox.html
            // 24 - 1951, 1955, 1959, 1963, 1967, 1971, 1975, 1979
            // 23 - others
            d = (y-3) % 4 == 0 ? 24 : 23;
          }
          else {
            // http://oshiete.goo.ne.jp/qa/1454974.html
            d = parseInt(23.2488 + 0.242194 * ( y - 1980)) - parseInt((y - 1980)/ 4);
          }

          return new hdayjp.Result(id, d);
        };

        // ================================================
        // All entries
        // ================================================
        hdayjp.entries = [
          // 1948 (July-)
          // 2014-12-10 - syear of NYD,CAD,(Vernal),EBD,CTD,CDD are changed (1948 to 1949)
          // (issue #2)
          new hdayjp.FixedEntry("NYD",1949,null, 0, 1), // 元日
          new hdayjp.FixedEntry("CAD",1949,1999, 0, 15), // 成人の日(1月15日)
          new hdayjp.VernalEquinoxEntry(1949,null), // 春分
          new hdayjp.FixedEntry("EBD",1949,1988, 3, 29), // 天皇誕生日(4月29日) -1988
          new hdayjp.FixedEntry("CTD",1949,null, 4, 3), // 憲法記念日(5月3日)
          new hdayjp.FixedEntry("CDD",1949,null, 4, 5), // こどもの日(5月5日)
          new hdayjp.AutumnEquinoxEntry(1948,null), // 秋分
          new hdayjp.FixedEntry("CLD",1948,null, 10, 3), // 文化の日(11月3日)
          new hdayjp.FixedEntry("LTD",1948,null, 10, 23), // 勤労感謝の日(11月23日)
          // 1966
          new hdayjp.FixedEntry("NFD",1966,null, 1, 11), // 建国記念の日(2月11日)
          new hdayjp.FixedEntry("RAD",1966,2002, 8, 15), // 敬老の日(9月15日) - 2002
          new hdayjp.FixedEntry("HSD",1966,1999, 9, 10), // 体育の日(9月15日) - 1999
          // 1989
          new hdayjp.FixedEntry("GRD",1989,2006, 3, 29), // みどりの日(4月29日) - 2006
          new hdayjp.FixedEntry("EBD",1989,null, 11, 23), // 天皇誕生日(12月23日)
          // 1996
          new hdayjp.FixedEntry("MRD",1996,2002, 6, 20), // 海の日(7月20日) - 2002
          // 2000
          new hdayjp.WdayEntry("CAD",2000,null, 0, 2, 1), // 成人の日(1月第2月曜)
          new hdayjp.WdayEntry("HSD",2000,null, 9, 2, 1), // 体育の日(10月第2月曜)
          // 2003
          new hdayjp.WdayEntry("MRD",2003,null, 6, 3, 1), // 海の日(7月第3月曜)
          new hdayjp.WdayEntry("RAD",2003,null, 8, 3, 1), // 敬老の日(9月第3月曜)
          // 2007
          new hdayjp.FixedEntry("SWD",2007,null, 3, 29), // 昭和の日(4月29日)
          new hdayjp.FixedEntry("GRD",2007,null, 4, 4), // みどりの日(5月4日)
          // 2016
          new hdayjp.FixedEntry("MTD",2016,null, 7, 11), // 山の日(8月11日)
          null
        ];

        // ================================================
        // Count of mday (day of month) for each month.
        // ================================================
        hdayjp._mdays = [31,28,31,30,31,30,31,31,30,31,30,31];

        // ================================================
        //  Calculates MJD.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //    d: Day of month. Starting with 1.
        //  Returned value:
        //    Day of week code. Starting with 0 (0=Sun, ... 6=Sat).
        // ================================================
        hdayjp.calcMJD = function(y, m, d) {
          if( m <= 1 ) {
            y--;
            m += 12;
          }
          return Math.floor(365.25*y) + Math.floor(y/400) - Math.floor(y/100) + Math.floor(30.59*(m-1)) + d - 678912;
        };

        // ================================================
        //  Calculates Week of day code on 1st day in specified year and month.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    Week of day code. Starting with 0 (0=Sun, ... 6=Sat).
        // ================================================
        hdayjp.calcFirstWday = function(y, m) {
          var mjd = hdayjp.calcMJD(y, m, 1);
          return (mjd + 3) % 7;
        };

        // ================================================
        //  Calculates Days in specified year and month.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //  Returned value:
        //    Days.
        // ================================================
        hdayjp.calcMdays = function(y, m) {
          if( m == 1 && (y % 4) == 0 && ( (y % 100) != 0 || (y % 400) == 0 ) ) {
            return 29;
          }
          return hdayjp._mdays[m];
        };

        // ================================================
        //  Calculates holidayes in specified year and month.
        //  Arguments:
        //    y: Year.
        //    m: Month code. Starting with 0 (0=Jan, ... 11=Dec).
        //    ny: True/false value indicating whether returned value contains New Year's Holiday.
        //  Returned value:
        //    Array of hdayjp.Result.
        //    Returns null if y is less than 1948 or m is less than 0 or m is more than 11.
        // ================================================
        hdayjp.calculate = function(y, m, ny) {
          if( !(y >= 1948 && m >= 0 && m <=11) ) {
            return null;
          }

          var mdaytable = [];
          var fw = hdayjp.calcFirstWday(y, m);
          var mdays = hdayjp.calcMdays(y, m);
          // Entried Holidays
          for(var n = 0; n < hdayjp.entries.length; n++ ) {
            var e = hdayjp.entries[n];
            if( e != null && e.hit(y, m) ) {
              var r = e.calc(y, m);
              if( r != null ) {
                mdaytable[r.md] = r;
              }
            }
          }
          // Holiday in liew (HL) 1973/4(/12)-
          if( y > 1973 || (y = 1973 && m>=3) ) {
            for( var d = 7 - fw + 1; d <= mdays; d+= 7 ) {
              if( mdaytable[d] != null ) {
                var hit = false;
                for( var d1 = d + 1; !hit && d1 <= mdays; d1++ ) {
                  if( mdaytable[d1] == null && (d1+fw-1)%7 != 0 ) {
                    mdaytable[d1] = new hdayjp.Result("HL", d1);
                    d = d1; // updates d
                    hit = true;
                  }
                }
              }
            }
          }
          // National Holiday (NH) 1986-
          if( y >= 1986 ) {
            var st = 0;
            for( var d = 1; d <= mdays - 2; d++ ) {
              if( mdaytable[d] != null && mdaytable[d].id != "HL" &&
                  mdaytable[d+1] == null &&
                  mdaytable[d+2] != null && mdaytable[d+2].id != "HL" &&
                  ((d+1)+fw-1) % 7 ) {
                mdaytable[d+1] = new hdayjp.Result("NH", d+1);
                d = d + 1;
              }
            }
          }
          // New Years Holiday (NY)
          if( ny == true ) {
            if( m == 0 ) {
              for( var d = 1; d <= 3; d++ ) {
                if( (d + fw - 1) % 7 != 0 && mdaytable[d] == null ) {
                  mdaytable[d] = new hdayjp.Result("NY", d);
                }
              }
            }
            else if( m == 11 ) {
              for( var d = 29; d <= 31; d++ ) {
                if( (d + fw - 1) % 7 != 0 && mdaytable[d] == null ) {
                  mdaytable[d] = new hdayjp.Result("NY", d);
                }
              }
            }
          }
          // Extracts only holidays.
          var ret = [];
          for( var d = 1; d <= mdays; d++ ) {
            if( mdaytable[d] != null ) {
              ret.push(mdaytable[d]);
            }
          }
          return ret;
        };}  // end of hdayjp
        return hj;  // グローバルスコープにオブジェクトを出す。
    }();