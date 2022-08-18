// ==UserScript==
// @name         翱翔门户选课增强
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  翱翔门户选课增强，显示已选人数
// @author       2ndelement
// @match        https://jwxt.nwpu.edu.cn/course-selection/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nwpu.edu.cn
// @grant        none
// @run-at       document-end
// @namespace    https://github.com/2ndelement/nwpu-lesson-select-enhance
// @supportURL   https://github.com/2ndelement/nwpu-lesson-select-enhance
// @homepageURL  https://github.com/2ndelement/nwpu-lesson-select-enhance
// ==/UserScript==

(function () {
  function run() {
    "use strict";
    var urlReg =
      /https:\/\/jwxt.nwpu.edu.cn\/course-selection\/#\/course-select\/(\d+)\/turn\/(\d+)\/select/;
    var groups = urlReg.exec(window.location.href);

    var studentId = groups[1];
    var turnId = groups[2];

    var token = document.cookie.match(/token=([^;]+)/)[1];
    var getCourses = new XMLHttpRequest();
    getCourses.open(
      "GET",
      "https://jwxt.nwpu.edu.cn/course-selection-api/api/v1/student/course-select/selected-lessons/" +
        turnId +
        "/" +
        studentId,
      false
    );
    getCourses.setRequestHeader("Authorization", token);
    getCourses.send(null);
    var courses = JSON.parse(getCourses.responseText)["data"];
    var t = document.querySelectorAll("table.el-table__body")[0];
    var coursesDom = t.querySelectorAll("tr.el-table__row");
    for (var i = 0; i < coursesDom.length; i++) {
      var courseName = coursesDom[i].outerText.match(/(.*?)[\nU]/)[1].trim();
      var currentCourse = courses.find(
        (item) => item["course"]["nameZh"] == courseName
      );
      var pannel = coursesDom[i].querySelector(
        "div.control-label.pinned-label"
      );
      if (!pannel) {
        continue;
      }
      var selectReg =
        /<th width="11%">已选学生数<\/th>\n.*?<td width="12%">(\d+)<\/td>\n.*?<th width="10%">待释放保留人数<\/th>\n.*?<td width="12%"><span>(\d+)<\/span><\/td>\n.*?\n.*?\n.*?<th>选课人数上限<\/th>\n.*?<td>(\d+)<\/td?/;
      var getSelected = new XMLHttpRequest();
      getSelected.open(
        "GET",
        "https://jwxt.nwpu.edu.cn/student/for-std-lessons/info/" +
          currentCourse["id"],
        false
      );
      getSelected.send(null);
      groups = getSelected.responseText.match(selectReg);
      var overNum = parseInt(groups[1]) - parseInt(groups[3]);
      var color = overNum > 0 ? "red" : "green";
      pannel.innerHTML =
        "<font color=" + color + ">" + groups[1] + "</font>" + "/" + groups[3];
    }
  }
  setTimeout(run, 500);
})();
