thread threadFunc() {
    var c = asyncFunc(a, b, _);
    var e = asyncFunc2(c, d, _);
    console.log(e);
}

thread threadFunc1(a, b, c) {
    var anonymous = thread() {
        console.log('boopie');
    };
    doABarrelRoll(anonymous);
    return anonymous, c;
}

thread threadFunc() {
    var c = asyncFunc(a, b, _);
    var e = asyncFunc2(c, d, _);
    console.log(e);
    return c, e;
}

function threadFunc() {
    asyncFunc(a, b, function() {
        var c = arguments;
        asyncFunc2(c, d, function() {
            var e = arguments;
            console.log(e);
        });
    });
}