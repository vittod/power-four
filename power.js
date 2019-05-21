
"use strict";

(function() {

    var board = $('#board');
    var boardOver = $('#board-overlay');
    var boardBg = $('#board-bg');
    var columns = $('.column');
    var columnsOver = $('.column-overlay');
    var message = $('.message');
    var slots = $('.slot');
    var modalWin = $('.modal.win');
    var modalStart = $('.modal.start');
    var selectColums = $('#select-colums');

    var game = $('#game');
    var triggerPoints = $('.trigger-point');
    var stackRed = $('#coinstack-red');
    var stackBlue = $('#coinstack-blue');
    var currentPlayer = 'playerRed';
    var boardSize = 7;

    var triggerZone = $('#trigger-area');

    columns.on('click', function(e) {
        pushCoin(e.currentTarget);
    });
    modalStart.on('click', '.btn', function() {
        startGame();
    })
    $('.btn.reset').on('click', lazyReset);



    function startGame() {
        generateStack(stackRed, '.playerRed');
        generateStack(stackBlue, '.playerBlue');
        boardSize = +selectColums.val();
        setBoardSize(boardSize);
        setTimeout(function() {
            toggleTriggerZone();
            changeStack();
            refreshSlots();
        }, boardSize * 170);
        modalStart.removeClass('on');
    }

    function refreshSlots() {
        columns = $('.column');
        slots = $('.slot');
    }

    function lazyReset() {
        location.reload(true);
    }

    ////////////////////////////game control
    game.on('mousedown', '#coinstack-red', function(e) {
        game.append('<div class="playerRed insert"></div>');
    }).on('mousedown', '#coinstack-blue', function() {
        game.append('<div class="playerBlue insert"></div>');
    }).on('mousemove', function(e) {
        $('.insert').css({left: e.clientX - 20, top: e.clientY - 20});
    }).on('mouseup', function() {
        $('.insert').remove();
    });
    triggerPoints.on('mouseup', function(e) {
        console.log(columns.eq(triggerPoints.index(e.target)));
        pushCoin(columns.eq(triggerPoints.index(e.target)));
    })

    function generateStack(stack, name) {
        var accelerate = 100;
        function generate(stack, name) {
            let x = Math.floor(stack.width() * Math.random() / 8);
            let y = Math.floor(stack.height() * Math.random() / 8);
            if (stackRed.children().length < 12) {
                setTimeout(function() {
                    stack.append('<div class="' + name.substring(1) + '"></div>').children().last().css({position: 'relative', left: x, top: y});
                    generate(stack, name);
                }, accelerate);
                accelerate > 0 ? accelerate -= 9 : accelerate = 0;
            } else {
                //accelerate = 100;
            }
        };
        generate(stack, name);
    }

    function toggleTriggerZone() {
        triggerPoints.eq(1).hasClass('indicator') ? triggerPoints.removeClass('indicator') : triggerPoints.addClass('indicator');
    }

    function changeStack() {
        if (!stackRed.children().eq(0).hasClass('indicator')) {
            stackRed.children().addClass('indicator');
            stackRed.css({pointerEvents: 'auto'});
            stackBlue.children().removeClass('indicator');
            stackBlue.css({pointerEvents: 'none'});
        } else {
            stackRed.children().removeClass('indicator');
            stackRed.css({pointerEvents: 'none'});
            stackBlue.children().addClass('indicator');
            stackBlue.css({pointerEvents: 'auto'});
        }
    }

    ////////////////////////////set up the game
    function setBoardSize(numberOfColums) {
        var count = 1;
        function makeColumns() {
            board.css({left: parseInt(board.css('left').replace('px')) - 25, width: board.width() + 54});       //add width to board
            boardBg.css({left: parseInt(boardBg.css('left').replace('px')) - 25, width: boardBg.width() + 54});     //add width to bg
            boardOver.css({left: parseInt(boardOver.css('left').replace('px')) - 25, width: boardOver.width() + 54});     //add width to overlay
            triggerZone.css({left: parseInt(triggerZone.css('left').replace('px')) - 25, width: triggerZone.width() + 50});       //add width to trigger zone

            columns.eq(columns.length -1).clone(true).appendTo(board);                                              //clone board col
            columnsOver.eq(columnsOver.length -1).clone(true).appendTo(boardOver);                                  //add overlay col
            triggerPoints.eq(columns.length -1).clone(true).appendTo(triggerZone);                                  //clone board col


            count += 1;
            if (count < numberOfColums) {
                setTimeout(function() {
                    makeColumns();
                }, 100);
            } else {
                triggerPoints = $('.trigger-point');
            }
        }
        makeColumns();
    }

    ////////////////////////////inner game logic
    function switchPlayer() {
        currentPlayer === 'playerRed' ? currentPlayer = 'playerBlue' : currentPlayer = 'playerRed';
        toggleTriggerZone();
        setTimeout(function() {
            toggleTriggerZone();
            changeStack();
        }, 500)

    }

    function pushCoin(column) {
        let currentColumn = $(column);
        let slot;
        for (var i = 6; i > 0; i--) {
            if (currentColumn.find('.row' + i).hasClass('playerRed') || currentColumn.find('.row' + i).hasClass('playerBlue')) {

            } else {
                slot = currentColumn.find('.row' + i).addClass(currentPlayer).addClass('drop');
                let outcomeTurn = checkVicotry(currentColumn, '.row' + i, slot);
                if (outcomeTurn[0]) {
                    handleWin(outcomeTurn);
                } else {
                    switchPlayer();
                }
                break;
            }
        }
    }

    function handleWin(outcomeTurn) {
        toggleTriggerZone();
        stackBlue.children().removeClass('indicator');
        stackRed.children().removeClass('indicator');
        outcomeTurn[1].forEach(function(el) {
            slots.eq(el).addClass('win');
        })
        setTimeout(function() {
            message.prepend('<h1>' + currentPlayer + ' wins</h1>');
            modalWin.addClass('on');
            modalWin.removeClass('win');
        }, 1500);
    }

    function checkVicotry(column, row, slot) {

        let resRow = checkRow(row);
        let resCol = checkCol(column, row);

    //////////////////////////////////outsource later

        //make an object for keeping track of this fn executions diaScore top left to bottoom right
        let leftToRight = {
            count: -1,
            seq: ''
        };
        //opening a collection for left to right diagonal starting with current move
        let resDiaLeft = [slots.index(slot)];

        //check the diagonal left to right and get to the lowest possible field number
        for (let i = 4; i > 0; i--) {
            if (resDiaLeft[resDiaLeft.length - 1] - 7 > 0) {
                resDiaLeft[0] = resDiaLeft[0] - 7;
            }
        };
        //make a collection of all possible diagonal fields left to right over the whole board
        for (let i = boardSize; i > 0; i--) {
            if (resDiaLeft[resDiaLeft.length - 1] + 7 < boardSize * 6)
            resDiaLeft.push(resDiaLeft[resDiaLeft.length - 1] + 7);
        };
        // filter the collection for currentPlayer hits
        let winResDiaLeft = resDiaLeft.filter(function(el) {
            return slots.eq(el).hasClass(currentPlayer);
        //find out if hits are connected
        }).map(function(el) {
            let columnIndex = slots.eq(el).parent().index();
            if (leftToRight.count <= 0) {
                leftToRight.count = columnIndex;
                leftToRight.seq += 'd';
                return {
                    column: columnIndex,
                    slot: el
                }
            } else if (columnIndex === leftToRight.count + 1) {
                leftToRight.count = columnIndex;
                leftToRight.seq += 'd';
                return {
                    column: columnIndex,
                    slot: el
                }
            } else {
                leftToRight.count = columnIndex;
                leftToRight.seq += 'xd';
                return [
                    {},
                    {
                        column: columnIndex,
                        slot: el
                    }
                ];
            }
        }).flat();

    //////////////////////////////////outsource end

    //////////////////////////////////outsource later
        //make an object for keeping track of this fn executions diaScore top right to bottom left
        let rightToLeft = {
            count: -1,
            seq: ''
        };
        //opening a collection for right to left diagonal starting with current move
        let resDiaRight = [slots.index(slot)];

        //check the diagonal right to left and get to the lowest possible field number
        for (let i = 4; i > 0; i--) {
            if (resDiaRight[resDiaRight.length - 1] - 5 > 0) {
                resDiaRight[0] = resDiaRight[0] - 5;
            }
        };
        //make a collection of all possible diagonal fields left to right over the whole board
        for (let i = boardSize; i > 0; i--) {
            if (resDiaRight[resDiaRight.length - 1] + 5 < boardSize * 6)
            resDiaRight.push(resDiaRight[resDiaRight.length - 1] + 5);
        };
        // filter the collection for currentPlayer hits
        let winResDiaRight = resDiaRight.filter(function(el) {
            return slots.eq(el).hasClass(currentPlayer);
        //find out if hits are connected
        }).map(function(el) {
            let columnIndex = slots.eq(el).parent().index();
            if (rightToLeft.count <= 0) {
                rightToLeft.count = columnIndex;
                rightToLeft.seq += 'd';
                return {
                    column: columnIndex,
                    slot: el
                }
            } else if (columnIndex === rightToLeft.count + 1) {
                rightToLeft.count = columnIndex;
                rightToLeft.seq += 'd';
                return {
                    column: columnIndex,
                    slot: el
                }
            } else {
                rightToLeft.count = columnIndex;
                rightToLeft.seq += 'xd';
                return [
                    {},
                    {
                        column: columnIndex,
                        slot: el
                    }
                ];
            }
        }).flat();
    //////////////////////////////////outsource end

        // check if conditions for win are met

        if (resCol.seq.indexOf('vvvv') >= 0) {
            let winColStart = resCol.seq.indexOf('vvvv');
            return [true, resCol.slots.slice(winColStart, winColStart + 4)];
        } else if (resRow.seq.indexOf('hhhh') >= 0) {
            let winRowStart = resRow.seq.indexOf('hhhh');
            return [true, resRow.slots.slice(winRowStart, winRowStart + 4)];
        } else if (leftToRight.seq.indexOf('dddd') >= 0) {
            let winStartL = leftToRight.seq.indexOf('dddd');
            let resSlots = winResDiaLeft.slice(winStartL, winStartL + 4).map(function(el) {
                return el.slot;
            })
            return [true, resSlots];
        } else if (rightToLeft.seq.indexOf('dddd') >= 0) {
            let winStartR = rightToLeft.seq.indexOf('dddd');
            let resSlots = winResDiaRight.slice(winStartR, winStartR + 4).map(function(el) {
                return el.slot;
            });
            return [true, resSlots];
        } else {
            return [false];
        }

    }

    function checkRow(row) {
        //make an object to keep track of this fn executions row score
        let resRow = {
            seq: '',
            slots: []
        };
        //check the row
        for (let i = boardSize - 1; i >= 0; i--) {
            let currentSlotRow = columns.eq(i).find(row);
            if (currentSlotRow.hasClass(currentPlayer)) {
                resRow.seq += 'h';
                resRow.slots.push(slots.index(currentSlotRow))
            } else {
                resRow.seq += 'x';
                resRow.slots.push('x');
            }
        };
        return resRow;
    }

    function checkCol(column, row) {
        //make an object to keep track of this fn executions col score
        let resCol = {
            seq: '',
            slots: []
        };
        // check the column
        for (let i = 6; i > 0; i--) {
            let currentSlotColumn = column.find('.row' + i);
            if (currentSlotColumn.hasClass(currentPlayer)) {
                resCol.seq += 'v';
                resCol.slots.push(slots.index(currentSlotColumn));
            } else {
                resCol.seq += 'x';
                resCol.slots.push('x');
            }
        };
        return resCol;
    }

})();
