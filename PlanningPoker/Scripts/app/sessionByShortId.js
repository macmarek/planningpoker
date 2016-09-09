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
        var row = "<tr><td>" + num +"</td>" +
            "<td>" + member.Name + "</td><td>";
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

    $("#session-id").html(app.session.ShortId);
    $("#session-url").val(window.location.href);
    app.setExpirationDate();

    $("#session-details").show();

    $("#add-member").click(function () {
        app.addMember();
    });

    $("#start-voting").click(function () {
        app.startVoting();
    });

    $("#stop-voting").click(function () {
        app.stopVoting();
    });

    $("#add-vote").click(function () {
        app.addVote();
    });

    $("#copy-to-cb").click(function() {
        try {
            $("#session-url").select();
            var successful = document.execCommand('copy');
            if (!successful) {
                alert("Unable to copy. Plase copy it manually.");
            } else {
                $("#copied-to-cb").removeClass("fa-square-o");
                $("#copied-to-cb").addClass("fa-check-square-o");
            }
        } catch (err) {
            alert("Unable to copy. Plase copy it manually.");
        }
    });

    app.refreshList();

    app.refreshUserInfo();

    app.refreshVotingArea();

    app.refreshUserVotingArea();

    app.refreshVotingButtons();
};

app.refreshVotingArea = function () {

    if (app.session.IsVoting) {
        $("#start-voting").hide();
        $("#stop-voting").show();
        $("#session-status").show();
        $("#voting-area").show();
        $("#members-list").show();
        $("#enter-name").hide();
        //$("#enter-name").hide();
    } else {
        $("#start-voting").show();
        $("#stop-voting").hide();
        $("#session-status").hide();
        $("#voting-area").show();
        //$("#enter-name").show()
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

    if (!app.currentMember.Vote) {
        $("#add-vote-area").show();
        $("#vote-status-area").hide();
    } else {
        $("#add-vote-area").hide();
        $("#current-vote-value").html(app.currentMember.Vote);
        $("#vote-status-area").show();
    }
};

app.refreshVotingButtons = function() {
    if (!app.currentMember) {
        $("#voting-buttons").hide();
        return;
    }

    if (!app.currentMember.IsAdmin) {
        $("#voting-buttons").hide();
        return;
    }

    $("#voting-buttons").show();
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
            chat.server.refreshMemberList(app.session.ShortId);
            app.refreshUserInfo();
            app.refreshUserVotingArea();
            app.refreshVotingButtons();
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

app.setExpirationDate = function () {
    var date = new Date(app.session.ExpireTimeUtc);
    $("#session-expiry").html(date.toLocaleDateString() + " - " + date.toLocaleTimeString());
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
            $("#vote-value").val("");
            //chat.server.refreshMemberList(app.session.ShortId);
        },
        error: function () {
            alert("error");
        },
        dataType: "json"
    });
}

app.stopVoting = function () {
    if (!app.session.IsVoting) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "/api/StopVoting",
        data: { ShortId: app.session.ShortId, MemberId: app.currentMember.Id },
        success: function (data) {
            app.session.IsVoting = false;
            app.refreshUserInfo();
            app.refreshVotingArea();
            app.refreshUserVotingArea();
            chat.server.refreshMemberList(app.session.ShortId);
        },
        error: function () {
            alert("error");
        },
        dataType: "json"
    });
}

app.addVote = function () {
    if (!app.session.IsVoting) {
        return;
    }

    var vote = $("#vote-value").val();

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
            app.storage.setUserForSession(app.session.ShortId, app.currentMember);
            app.refreshUserVotingArea();
            chat.server.refreshMemberList(app.session.ShortId);
        },
        error: function () {
            alert("error");
        },
        dataType: "json"
    });
};

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

    this.setUserForSession = function (shortId, user) {
        var json = JSON.stringify(user);
        localStorage.setItem(shortId + "user", json);
    }
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
        app.refreshUserInfo();
        app.refreshVotingArea();
        app.refreshUserVotingArea();
    };

    chat.client.addedToGoupCallback = function (data) {
        app.hideLoading();
        app.init();
    };


    app.showLoading("Joining session ...");
    $.connection.hub.start()
        .done(function () {
            console.log("hub started ...");
            chat.server.joinGroup(app.session.ShortId);
        });
});