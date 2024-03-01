var fs = require("fs");

var interns = {
  U02TPSYRUPK: { github: "rabilrbl", name: "Mohammed Rabil" },
  U02TB83Q5V0: { github: "skks1212", name: "Shivank Kacker" },
  U02T4HFA07Q: { github: "Ashesh3", name: "Ashesh Kumar" },
  U02TDGQ0TFE: { github: "Marmik2003", name: "Marmik Patel" },
  U02TB8XHZD1: { github: "sainAk", name: "Aakash Singh" },
  U02TB823H8A: { github: "siddnikh", name: "Siddharth Nikhil" },
  U02T4HD63P0: { github: "patelaryan7751", name: "Aryan Patel" },
  U02TB90FU2X: { github: "cp-Coder", name: "Abhiuday Gupta" },
  U02U102TL0G: { github: "iamsdas", name: "Suryashankar Das" },
  U02TDGQQPMJ: { github: "rithviknishad", name: "Rithvik Nishad" },
  U02TPSYB1MF: { github: "Pranshu1902", name: "Pranshu Aggarwal" },
  U02SWK752TZ: { github: "kunatastic", name: "Kunal Kumar Jha" },
  U02U103J5LG: { github: "ishanExtreme", name: "Ishan Mishra" },
  U02U1035G0G: { github: "GokulramGHV", name: "Gokulram A" },
  U02T4HE96KY: { github: "Ritesh-Aggarwal", name: "Ritesh Aggarwal" },
  U02TPSZMJRF: { github: "naman114", name: "Naman Gogia" },
  U02TB83MU9G: { github: "anuran-roy", name: "Anuran Roy" },
  U02TB8X9WRZ: { github: "Pragati1610", name: "Pragati Bhattad" },
};

var generateContent = (name, github, slack) => {
  return `---
name: ${name}
title: GDC Intern
github: ${github}
twitter: ${github}
linkedin: ${github}
slack: ${slack}
joining_date: "09/05/2022"
role: intern
---

Still waiting for this    
`;
};

Object.entries(interns).forEach(([key, value]) => {
  fs.writeFile(
    `${value.github}.md`,
    generateContent(value.name, value.github, key),
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    },
  );
});
