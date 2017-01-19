var chat = null;

app.refreshList = function () {
    var $elem = $("#members-list");
    if (!app.session.Members || app.session.Members.length === 0) {
        $elem.html("");
        $("#users-table").hide();
        return;
    }
    var html = "";
    for (var i = 0; i < app.session.Members.length; i++) {
        var member = app.session.Members[i];
        var num = i + 1;
        var displayName = member.IsAdmin ? member.Name + " (admin)" : member.Name;
        var row = "<tr><td>" + num +"</td>" +
            "<td>" + displayName + "</td><td>";
        if (member.Vote) {
            var voteText = app.session.IsVoting ? "voted" : member.Vote;
            row += voteText;
        }
        row += "</td></tr>";
        html += row;
    }
    $elem.html(html);
    $("#users-table").show();
};

app.init = function () {

    app.storage = new app.LocalStorageWrapper();
    app.storage.init({
        errorElement: "#no-storage"
    });
    app.currentMember = app.storage.getUserForSession(app.session.ShortId);
    if (app.currentMember) {
        app.currentMember.Vote = null;
    }

    $("#session-id").html(app.session.ShortId);

    $("#session-url").val(window.location.href);

    if (app.session.Title) {
        app.setSessionTitle(app.session.Title);
        $('#session-title').val(app.session.Title);
    }
    
    app.setQrLink();

    app.setupPokerButtons();

    $("#session-details").show();

    $("#add-member").click(function () {
        app.addMember();
    });

    app.listenForEnterFor("#member-name", "#add-member");

    $("#start-voting").click(function () {
        app.startVoting();
    });

    $("#stop-voting").click(function () {
        app.stopVoting();
    });

    $("#add-vote").click(function () {
        app.addVote();
    });

    $("#revote").click(function() {
        app.revote();
    });

    app.setupTitleInput();

    app.listenForEnterFor("#vote-value", "#add-vote");

    $("#copy-to-cb").click(function() {
        try {
            $("#session-url").select();
            var successful = document.execCommand('copy');
            if (!successful) {
                alert("Unable to copy. Plase copy it manually.");
            } else {
                $("#copy-to-cb>span").text("Copied");
                $("#copied-to-cb").removeClass("fa-square-o");
                $("#copied-to-cb").addClass("fa-check-square-o");
                setTimeout(function() {
                    $("#copy-to-cb>span").text("Copy url");
                    $("#copied-to-cb").removeClass("fa-check-square-o");
                    $("#copied-to-cb").addClass("fa-square-o");
                },
                1500);
            }
        } catch (err) {
            alert("Unable to copy. Plase copy it manually.");
        }
    });

    $("#session-url").focus(function () {
        $(this).select();
    });

    app.refreshList();

    app.refreshUserInfo();

    app.refreshVotingArea();

    app.refreshUserVotingArea();

    app.refreshAdminArea();
};

app.setupTitleInput = function() {

    $('#session-title').on('input', function (e) {
        var text = $(this).val();
        app.setSessionTitle(text);
        clearTimeout(app.setTitleTimeout);
        app.setTitleTimeout = setTimeout(function() {
            chat.server.changeTitle(app.currentMember.Id, app.session.ShortId, text);
        }, 500);
    });
};

app.setSessionTitle = function(title) {
    $('#title').html(title);
};

app.setQrLink = function() {
    var url = window.location.href;
    var qrurl1 = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" + url;
    var qrurl2 = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + url;
    $("#qrlink").attr("href", qrurl2);
    $("#qrlink>img").attr("src", qrurl1);
};

app.listenForEnterFor = function(listenOn, triggerClickOn) {
    $(listenOn).bind('keypress', function (event) {
        if (event.keyCode === 13) {
            $(triggerClickOn).trigger('click');
        }
    });
};

app.refreshVotingArea = function () {

    if (app.session.IsVoting) {
        $("#start-voting").hide();
        $("#stop-voting").show();
        $("#session-status").show();
        $("#voting-area").show();
        $("#members-list").show();
    } else {
        $("#start-voting").show();
        $("#stop-voting").hide();
        $("#session-status").hide();
        $("#voting-area").show();
    }
};

app.refreshUserInfo = function () {
    if (app.currentMember) {
        $("#enter-name").hide();
        $("#name-info-span").html(app.currentMember.Name);
        var adminStatus = app.currentMember.IsAdmin ? "You are admin of this session" : "You are guest of this session";
        $("#admin-status").html(adminStatus);
        $("#name-info").show();
    } else {
        var lastUser = app.storage.getLastSessionUser();
        if (lastUser) {
            $('#member-name').val(lastUser.Name);
        }
        $("#enter-name").show();
        $("#name-info").hide();
    }
};

app.refreshUserVotingArea = function () {
    if (app.session.IsVoting) {
        $("#user-vote").show();
    } else {
        $("#user-vote").hide();
    }

    if (!app.currentMember) {
        $("#user-vote").hide();
        return;
    }

    if (!app.currentMember.Vote || app.currentMember.revoting) {
        $("#add-vote-area").show();
        $('#voting-options').show();
        $("#vote-value").focus();
        var voteValue = $("#vote-value").val();
        if (voteValue) {
            $("#vote-value").select();
        }
        $("#vote-status-area").hide();
    } else {
        $("#add-vote-area").hide();
        $('#voting-options').hide();
        $("#current-vote-value").html(app.currentMember.Vote);
        $("#vote-status-area").show();
    }
};

app.refreshAdminArea = function() {
    if (!app.currentMember) {
        $("#admin-area").hide();
        return;
    }

    if (!app.currentMember.IsAdmin) {
        $("#admin-area").hide();
        return;
    }

    $("#admin-area").show();
};

app.addMember = function () {
    if (app.currentMember != null) {
        return;
    }

    var name = $('#member-name').val();
    if (!name) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/AddMember",
        data: { ShortId: app.session.ShortId, Name: name },
        success: function (data) {
            app.currentMember = data;
            app.storage.setUserForSession(app.session.ShortId, data);
            app.storage.setLastSessionUser(data);
            chat.server.refreshMemberList(app.session.ShortId);
            app.refreshUserInfo();
            app.refreshUserVotingArea();
            app.refreshAdminArea();
        },
        error: function () {
            alert("could not add member");
        },
        dataType: "json"
    });
};

app.removeCurrentMember = function () {
    if (!app.currentMember) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/RemoveMember",
        data: { ShortId: app.session.ShortId, MemberId: app.currentMember.Id },
        success: function (data) {
            chat.server.refreshMemberList(app.session.ShortId);
        },
        error: function () {
            console.log("remove failed");
        },
        dataType: "json"
    });
};

app.startVoting = function () {
    if (app.session.IsVoting) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/StartVoting",
        data: { ShortId: app.session.ShortId, MemberId: app.currentMember.Id },
        success: function (data) {
            app.session.IsVoting = true;
            app.currentMember.Vote = null;
            app.refreshVotingArea();
            app.refreshUserVotingArea();
            chat.server.votingStarted(app.session.ShortId);

        },
        error: function () {
            alert("error");
        },
        dataType: "json"
    });
}

app.stopVoting = function() {
    if (!app.session.IsVoting) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/StopVoting",
        data: { ShortId: app.session.ShortId, MemberId: app.currentMember.Id },
        success: function(data) {
            app.session.IsVoting = false;
            app.refreshUserInfo();
            app.refreshVotingArea();
            app.refreshUserVotingArea();
            chat.server.refreshMemberList(app.session.ShortId);
            chat.server.votingStopped(app.session.ShortId);
        },
        error: function() {
            alert("error");
        },
        dataType: "json"
    });
};

app.addVote = function () {
    if (!app.session.IsVoting) {
        return;
    }

    var vote = $("#vote-value").val();
    if (!vote) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/Vote",
        data: {
            ShortId: app.session.ShortId,
            MemberId: app.currentMember.Id,
            Vote: vote
        },
        success: function (data) {
            app.currentMember.Vote = vote;
            app.currentMember.revoting = false;
            app.storage.setUserForSession(app.session.ShortId, app.currentMember);
            app.refreshUserVotingArea();
            chat.server.refreshMemberList(app.session.ShortId);
            $("#revote").show();
        },
        error: function () {
            alert("error");
        },
        dataType: "json"
    });
};

app.revote = function() {
    app.currentMember.revoting = true;
    app.refreshUserVotingArea();
    $("#revote").hide();
}

app.showLoading = function (message) {
    $("#loading-alert").show();
    $("#loading-message").html(message);
    $("#main-wrapper").hide();
};

app.hideLoading = function () {
    $("#loading-alert").hide();
    $("#main-wrapper").show();
};

app.LocalStorageWrapper = function () {

    this.init = function (config) {
        var storageSupported = typeof (Storage) !== "undefined";
        if (!storageSupported) {
            var $elem = $(config.errorElement);
            $elem.show();
        }
    }

    this.getUserForSession = function (shortId) {
        var itemString = localStorage.getItem(shortId + "user");
        if (!itemString) {
            return null;
        }
        return JSON.parse(itemString);
    };

    this.setUserForSession = function(shortId, user) {
        var json = JSON.stringify(user);
        localStorage.setItem(shortId + "user", json);
    };

    this.setLastSessionUser = function(user) {
        var json = JSON.stringify(user);
        localStorage.setItem("lastuser", json);
    };

    this.getLastSessionUser = function() {
        var itemString = localStorage.getItem("lastuser");
        if (!itemString) {
            return null;
        }
        return JSON.parse(itemString);
    };
};

app.blinkTimeoutId = null;
app.startTitleAnimation = function() {
    app.votingTitle = "Voting ... - Planning Poker";
    app.blinkTimeoutId = setInterval(function () {
        document.title = document.title == app.votingTitle ? "... - Planning Poker" : app.votingTitle;
    }, 1000);
};

app.stopTitleAnimation = function () {
    clearInterval(app.blinkTimeoutId);
    document.title = "Voting session - Planning Poker";
};

app.setupPokerButtons = function() {
    var options = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "coffe"];

    for (var i = 0; i < options.length; i++) {
        var o = options[i];
        $("#voting-options").append('<button type="button" class="btn btn-default vote-button">' + o + '</button>');
    }

    $(".vote-button").click(function() {
        var vote = $(this).text();
        $("#vote-value").val(vote);
        app.addVote();
    });

};

$(function () {
    chat = $.connection.pokerHub;

    chat.client.refreshMemberListCallback = function (data) {
        app.session = data;

        app.refreshList();

        app.refreshUserInfo();

        app.refreshVotingArea();

        app.refreshUserVotingArea();
    };

    chat.client.votingStartedCallback = function (data) {

        app.session = data;

        app.currentMember.Vote = null;
        app.currentMember.revoting = false;
        app.refreshUserInfo();
        app.refreshVotingArea();
        app.refreshUserVotingArea();

        app.startTitleAnimation();
        $("#revote").hide();
    };

    chat.client.votingStoppedCallback = function(data) {
        app.stopTitleAnimation();
    };

    chat.client.addedToGoupCallback = function (data) {
        app.hideLoading();
        app.init();
    };

    chat.client.changedTitleCallback = function(title) {
        app.setSessionTitle(title);
    };

    app.showLoading("Joining session ...");
    $.connection.hub.start()
        .done(function () {
            console.log("hub started ...");
            chat.server.joinGroup(app.session.ShortId);
        });
});