$(function () {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    var maxcount = 12;
    var counter = 0;
    var votes = ["1", "2", "3", "5", "8", "13", "20"];
    var vote = votes[getRandomInt(0, votes.length - 1)];
    var $elem = $("#voting");

    var update = function (text) {
        var t = $elem.html();
        $elem.html(t + text);
    };

    var go = function () {
        if (counter < 3) {
            update(" .");
            setTimeout(go, 2000);
            counter++;
            return;
        }
        else if (counter === 3) {
            update(" " + vote);
            setTimeout(go, 1000);
            counter++;
            return;
        }
        else if (counter < maxcount) {
            update(" " + vote);
            setTimeout(go, 100);
            counter++;
            return;
        }

        update(" done!");
        setTimeout(function () {
            counter = 0;
            $elem.html("");
            vote = votes[getRandomInt(0, votes.length - 1)];

            update("Let's vote");
            setTimeout(go, 500);
        },
        3000);
    };

    update("Let's vote");
    setTimeout(go, 2000);
})