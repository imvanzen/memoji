(function (window) {
    "use strict";

    var EMOJIS_LIST = [
        "1f590.png",
        "1f596.png",
        "1f600.png",
        "1f601.png",
        "1f602.png",
        "1f603.png",
        "1f604.png",
        "1f605.png",
        "1f606.png",
        "1f607.png",
        "1f608.png",
        "1f609.png",
        "1f610.png",
        "1f611.png",
        "1f612.png",
        "1f613.png",
        "1f614.png",
        "1f615.png",
        "1f616.png",
        "1f617.png",
        "1f618.png",
        "1f619.png",
        "1f620.png",
        "1f621.png",
        "1f622.png",
        "1f623.png",
        "1f624.png",
        "1f625.png",
        "1f626.png",
        "1f627.png",
        "1f628.png",
        "1f629.png",
        "1f630.png",
        "1f631.png",
        "1f632.png",
        "1f633.png",
        "1f634.png",
        "1f635.png",
        "1f636.png",
        "1f637.png",
        "1f638.png",
        "1f639.png",
        "1f640.png",
        "1f641.png",
        "1f642.png",
        "1f643.png",
        "1f644.png",
        "1f910.png",
        "1f911.png",
        "1f912.png",
        "1f913.png",
        "1f914.png",
        "1f915.png"
    ];

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function chunk(arr, size) {
        var arrays = [];

        while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
        }

        return arrays;
    }

    var board_state = {
        board: null,
        points: {
            time: 0,
            misses: 0,
            passes: 0,
            games: 0
        },
        refreshStats: function() {
            window.document.querySelector(".games__score").innerText = board_state.points.games;
            window.document.querySelector(".passes__score").innerText = board_state.points.passes;
            window.document.querySelector(".misses__score").innerText = board_state.points.misses;
        },
        incMisses: function() {
            board_state.points.misses += 1;
            board_state.refreshStats();
        },
        incPasses: function() {
            board_state.points.passes += 1;
            board_state.refreshStats();
        },
        incGames: function() {
            board_state.points.games += 1;
            board_state.refreshStats();
        },
        uncovered_cards: [],
        all_cards: 0,
        cards: [],
        timeout: null,
        compareCards: function () {
            if (board_state.cards.length < 2){
                return false;
            }

            var emoji1 = board_state.cards[0].getEmoji().name;
            var emoji2 = board_state.cards[1].getEmoji().name;

            return emoji1 === emoji2;
        },
        addCard: function (card) {
            board_state.cards.push(card);
        },
        doesHaveCards: function () {
            return board_state.cards.length >= 2;
        },
        clearState: function () {
            if (board_state.timeout) {
                clearTimeout(board_state.timeout);
            }

            var sec = !board_state.doesHaveCards() ? 2000 : 500;

            board_state.timeout = setTimeout(function () {
                board_state.cards.map(function (card) {
                    card.getCell().classList.toggle("flipped");
                });
                board_state.cards = [];
            }, sec)
        },
        approveState: function () {
            clearTimeout(board_state.timeout);
            board_state.cards.map(function (card) {
                card.getCell().classList.toggle("uncovered");
            });
            board_state.uncovered_cards = board_state.uncovered_cards.concat(board_state.cards);
            board_state.cards = [];
        },
        checkUncovered: function () {
            var uncovered_cell = window.document.querySelectorAll(".board__cell.uncovered");
            return uncovered_cell.length === board_state.all_cards;
        }
    };

    function Emoji(name) {
        var left_emoji = window.document.createElement("img");
        var right_emoji = window.document.createElement("img");

        left_emoji.src = "img/emojis/" + name;
        right_emoji.src = "img/emojis/" + name;
        left_emoji.className = "board__emoji";
        right_emoji.className = "board__emoji";

        this.name = name;

        this.getLeftEmoji = function () {
            return left_emoji;
        };

        this.getRightEmoji = function () {
            return right_emoji;
        };

        this.hide = function () {
            left_emoji.classList.add("hide");
            right_emoji.classList.add("hide");
        }
    }

    function BoardCell(x, y) {
        var self = this;

        var board_cell = window.document.createElement("div");
        board_cell.className = "board__cell ready";
        board_cell.style.width = x + "px";
        board_cell.style.height = y + "px";
        board_cell.timeout = null;

        var emoji = null;

        setTimeout(function () {
            board_cell.className = "board__cell";
        }, 200);

        var clickEvent = function (event) {
            event.preventDefault();
            if (event.target.classList.contains("flipped")) {
                return;
            }

            if (board_state.doesHaveCards()) {
                return;
            }

            event.target.classList.toggle("flipped");

            board_state.addCard(self);

            if (!board_state.doesHaveCards()) {
                board_state.clearState();
            } else {
                if (board_state.compareCards()) {
                    board_state.incPasses();
                    board_state.approveState();
                    if (board_state.checkUncovered()) {
                        var uncovered_cell = window.document.querySelectorAll(".board__cell.uncovered");
                        Array.prototype.map.call(uncovered_cell, function (cell) {
                            cell.classList.toggle("uncovered");
                            setTimeout(function () {
                                cell.classList.toggle("uncovered");
                            }, 200);
                            setTimeout(function () {
                                cell.classList.toggle("uncovered");
                                cell.classList.toggle("flipped");
                            }, 1200);
                        });
                        board_state.board.restart();
                    }
                } else {
                    board_state.incMisses();
                    board_state.clearState();
                }
            }
        };

        board_cell.addEventListener("mouseup", clickEvent, false);

        board_cell.addEventListener("touchend", clickEvent, false);

        self.setEmoji = function (obj) {
            emoji = obj;
        };

        self.getEmoji = function () {
            return emoji;
        };

        self.setCellContent = function (content) {
            board_cell.appendChild(content);
            return self;
        };

        self.clearCellContent = function () {
            board_cell.innerHTML = "";
            return self;
        };

        self.setPosition = function (x, y) {
            board_cell.style.top = x + "px";
            board_cell.style.left = y + "px";
            return self;
        };

        self.getCell = function () {
            return board_cell;
        };
    }

    function Board(board_name) {
        var self = this;
        var board = window.document.querySelector(board_name);

        var level = 1;
        var pair = 4;
        var x = level * pair;
        var y = level * pair;

        var board_cells = [];

        var board_emoji_wrapper = window.document.createElement("div");

        var e_x = 128;
        var e_y = 128;
        var gutter = 10;

        board_state.all_cards = x * y;

        board_emoji_wrapper.className = "board__emoji_wrapper";
        board_emoji_wrapper.style.width = (x * (e_x+gutter)) + "px";
        board_emoji_wrapper.style.height = (y * (e_y+gutter)) + "px";

        board.appendChild(board_emoji_wrapper);

        for (var i = 0; i < x; i++) {
            for (var j = 0; j < y; j++) {
                var board_cell = new BoardCell(e_x, e_y);
                board_cell = board_cell.setPosition(i * (e_x + gutter), j * (e_y + gutter));

                board_cells.push(board_cell);
            }
        }

        for (var i = 0; i < board_cells.length; i++) {
            board_emoji_wrapper.appendChild(board_cells[i].getCell());
        }

        var clear = function () {
            for (var cell in board_cells) {
                cell.clearCellContent();
            }
        };

        self.start = function () {
            var used_emoji = [];

            var getRandomEmoji = function () {
                var emoji = null;
                var emoji_added = false;

                while (!emoji_added) {
                    emoji = EMOJIS_LIST[Math.floor(Math.random() * EMOJIS_LIST.length)];
                    if (used_emoji.indexOf(emoji) === -1) {
                        used_emoji.push(emoji);
                        emoji_added = true;
                    }
                }

                return emoji;
            };

            var shuffled_board_cells = chunk(shuffle(board_cells), 2);
            var counter = 0;

            while (counter < shuffled_board_cells.length) {
                var emoji = new Emoji(getRandomEmoji());
                shuffled_board_cells[counter][0].setEmoji(emoji);
                shuffled_board_cells[counter][0].setCellContent(emoji.getLeftEmoji());
                shuffled_board_cells[counter][1].setEmoji(emoji);
                shuffled_board_cells[counter][1].setCellContent(emoji.getRightEmoji());

                counter += 1;
            }

            board_state.incGames();
        };

        self.cancel = function () {
            clear();
        };

        self.restart = function () {
            window.requestAnimationFrame(clear);
            self.start();
        }
    }

    window.addEventListener("load", function () {
        var mainContent = window.document.querySelector(".main-content");
        var gameContent = window.document.querySelector(".game-content");

        setTimeout(function () {
            mainContent.classList.toggle("active");
        }, 150);

        var playGameButton = window.document.getElementById("PlayGameButton");
        var cancelGameButton = window.document.getElementById("CancelGameButton");

        board_state.board = new Board("#GameApp .board");

        playGameButton.addEventListener("click", function () {
            mainContent.classList.remove("active");
            gameContent.classList.add("active");

            window.requestAnimationFrame(board_state.board.start);
        }, false);

        cancelGameButton.addEventListener("click", function () {
            mainContent.classList.add("active");
            gameContent.classList.remove("active");

            window.requestAnimationFrame(board_state.board.cancel);
        }, false);

    }, false);


})(window);