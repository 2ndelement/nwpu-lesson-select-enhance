// ==UserScript==
// @name         翱翔门户选课增强
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  翱翔门户选课增强，显示已选人数
// @author       2ndelement
// @match        https://jwxt.nwpu.edu.cn/course-selection/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nwpu.edu.cn
// @grant        none
// @run-at       document-end
// @namespace    https://github.com/2ndelement/nwpu-lesson-select-enhance
// @supportURL   https://github.com/2ndelement/nwpu-lesson-select-enhance
// @homepageURL  https://github.com/2ndelement/nwpu-lesson-select-enhance
// @license MIT
// ==/UserScript==

(function () {
  function run() {
    "use strict";
    var table = document.querySelectorAll("table.el-table__body")[0];
    var coursesDom = table.querySelectorAll("tr.el-table__row");
    const urlReg =
      /https:\/\/jwxt.nwpu.edu.cn\/course-selection\/#\/course-select\/(\d+)\/turn\/(\d+)\/select/;
    var groups = urlReg.exec(window.location.href);
    const studentId = groups[1];
    const turnId = groups[2];
    const token = document.cookie.match(/token=([^;]+)/)[1];
    const selectedLessonApi =
      "https://jwxt.nwpu.edu.cn/course-selection-api/api/v1/student/course-select/selected-lessons/" +
      turnId +
      "/" +
      studentId;
    var lessonStuCountApi =
      "https://jwxt.nwpu.edu.cn/course-selection-api/api/v1/student/course-select/std-count?lessonIds=";
    const headers = {
      Authorization: token,
    };
    var courses;
    var simpleCourses = {};

    fetch(selectedLessonApi, { method: "GET", headers: headers })
      .then((response) => response.json())
      .then((body) => {
        courses = body.data;
        courses.forEach((course) => {
          simpleCourses[course.id] = {
            name: course.course.nameZh,
            limit: parseInt(course.limitCount),
          };
          lessonStuCountApi += course.id + ",";
        });
        lessonStuCountApi = lessonStuCountApi.substring(
          0,
          lessonStuCountApi.length - 1
        );
        fetch(lessonStuCountApi, { method: "GET", headers })
          .then((response) => response.json())
          .then((body2) => {
            for (let key in body2.data) {
              simpleCourses[key].selected = parseInt(
                body2.data[key].split("-")[0]
              );
              for (let i = 0; i < coursesDom.length; i++) {
                var pannel = coursesDom[i].querySelector(
                  "div.control-label.pinned-label"
                );
                if (!pannel) {
                  continue;
                }
                var courseName = coursesDom[i].outerText
                  .match(/(.*?)[\nU]/)[1]
                  .trim();
                var currentCourse;
                for (let key in simpleCourses) {
                  if (simpleCourses[key].name == courseName) {
                    currentCourse = simpleCourses[key];
                  }
                }
                var overNum = currentCourse.selected - currentCourse.limit;
                var color = overNum > 0 ? "red" : "green";
                pannel.innerHTML =
                  "<font color=" +
                  color +
                  ">" +
                  currentCourse.selected +
                  "</font>" +
                  "/" +
                  currentCourse.limit;
              }
            }
          });
      });
  }
  setInterval(run, 1000);
})();
