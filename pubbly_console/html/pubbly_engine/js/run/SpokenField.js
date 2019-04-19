/*
Mostly a proof of concept for an Encyclopedia Britanica bid we probably didn't get...
They wanted a million billion fields with audio files of the spoken contents of said field, and they wanted the fields to "highlight" along with the voice actors reading of them,
but they didn't want to pay some poor intern to manually time out each word movement, i.e. {"see": 0.35, "spot": 0.98", "run": 1.46}

AND THEY WANTED IT DONE IN A WEEK, so instead of finding some expensive licensed library where you can get somewhat decent voice recognition, I just decided to guestimate based on sentence length.
Note, EB at least had the voice overs broken up sentence by sentence...

So if you know the sentence is "See spot run", and you know the associated audio file is 1.5s long, you can KIND OF get close enough for it to look OK in a foreign language, and damnit EB that's the best you're going to get on a few freaking days notice.

This is that. Not sure if we'll ever use it, but I was proud enough of it for it to stay in.
*/
class SpokenField {
    syncTextToAud() {
        this.currentWord = -1;
        let ct = this.aud.currentTime;
        if (ct >= this.aud.duration) {
            window.clearInterval(this.playSync);
            this.runtimeCallbacks.done();
        }   else    {
            let at = this.wordTiming.findIndex(t => t >= ct);
            // Only update dom when highlight word changes, even though this is checked on a much faster interval.
            if (this.currentWord !== at) {
                this.runtimeCallbacks.prog(at);
            }
        }
    }

    // Neuonced count progression
    getTimes_linearWords(aud, words) {
        let ret = [];

        // Regular intervals (assuming each word is spoken the same length as the last
        let regularWordLength = aud.duration / words.length;
        for (let i = 1; i <= words.length; i++) {
            ret.push(i * regularWordLength);
        }
        return ret;
    }

    getTimes_linearSyllables(aud, words) {
        let ret = [];

        let sylls = [];
        let totalChunks = 0;
        words.forEach(function(word) {
            let syllC = syll_count(word);
            sylls.push(syllC);
            totalChunks += syllC;
        });
        let chunkLength = aud.duration / totalChunks;
        // refactor with reduce?
        let accumulator = 0;
        sylls.forEach(function(syllC) {
            let len = chunkLength * syllC;
            accumulator += len;
            ret.push(accumulator);
        });

        return ret;
    }

    getTimes_linearWithTweaks(aud, words) {
        let ret = [];

        let sylls = [];
        words.forEach(function(word) {
            let syllC = syll_count(word);
            sylls.push(syllC);
        });

        sylls = sylls.map(function(syll, i) {
            // A bunch of fucking guess work

            // 4 and 5 syll count words are usually a lot smaller than their true count
            if (syll >= 4) {
                syll *= 0.9;
            }

            // Commas seem to be about 2 syllables each
            if (words[i].split(",").length > 1) {
                syll += 2;
            }

            // 2 letter words are spoken faster than a single syllable
            if (words[i].length <= 3) {
                syll = 0.7;
            }
            
            // console.log(words[i] + ": " + syll);
            return syll;
        });

        let totalChunks = 0;
        sylls.forEach(function(syllC) {
            totalChunks+=syllC;
        });
        totalChunks++;
        let audLen = aud.duration; 
        let chunkLength = audLen / totalChunks;
        // refactor with reduce?
        let accumulator = 0;

        sylls.forEach(function(syllC) {
            let len = chunkLength * syllC;
            accumulator += len;
            ret.push(accumulator);
        });

        let last = ret[ret.length-1];
        let bent = ret.map(function(syll) {
            syll = easeInOutSine(syll, 0, last, last);
            return syll;
        });
        // STRONG distortion... Think it's better left alone.
        return ret;
    }

    play() {
        this.wordTiming = this.getTimes(this.aud, this.words);
        // If the aud is 5 seconds, and there are 5 words, I'm looking for
        // [1, 2, 3, 4, 5]
        // Meaning... Hold word 0 until second 1, hold word 1 until second 2...

        if (this.wordTiming) {
            let promise = this.aud.play();
            this.aud.playbackRate = this.speed;
            this.playSync = window.setInterval(this.syncTextToAud.bind(this), 10);
            this.aud.volume = 1;
        }
    }
    kill() {
        if (this.aud) {
            this.aud.pause();
        }
        if (this.playSync) {
            window.clearInterval(this.playSync);
        }
    }
    loadAud(cbs) {
        cbs = Object.assign({done:function() {}, fail: function() {}}, cbs);
        this.aud = new Audio();
        this.aud.autostart = 0
        this.aud.volume = 0;
        this.aud.addEventListener('canplaythrough', function() {
            cbs.done();
        }.bind(this), false);
        this.aud.setAttribute("src", this.audSrc);
    }
    constructor(audSrc, text, calcType, speed, cbs) {
        // Binding
        this.audSrc = audSrc;
        this.text = text;
        let types = ['linearWords','linearSyllables','linearWithTweaks'];
        this.calcType = (types.indexOf(calcType) !== -1) ? calcType : types[types.length-1];
        this.speed = speed || 1;
        this.getTimes = this["getTimes_" + this.calcType];
        this.runtimeCallbacks = Object.assign(
            {done:function(){},fail:function(){},prog:function(){}},
            cbs
        );

        // interval func to sync the text to the audio once playing
        this.playSync = false;
        // How long to stay on each word
        this.timing = [];
        // Current runtime word to highlight up to
        this.currentWord = false;

        // First manips
        this.words = this.text.split(" ");

        // works
        // this.setHighlightToWord(3);
        this.loadAud(
            {
                done:function() {
                    this.play();
                }.bind(this)
            }
        );
    }
}

/* http://gizma.com/easing/
 * So it's starting to look like most VO talents apply a ease-in-out flow to single sentence speach. If I apply a simple function to the array, the timing might get a little closer.
 */
function easeInOutQuad(t, b, c, d) {
    /*
     * t: current time
     * b: start value
     * c: change in value
     * d: duration
     */
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};
function easeInOutSine(t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};
// https://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript

// Needs improvement... syll_count("everywhere"); -> returns 4, but is 3... english
// everywhere -> 3
// flying -> 2
function syll_count(word) {
    word = word.toLowerCase();                                     //word.downcase!

    let forceOverrides = [
        ["every", 2],
        ["where", 1],
        ["ing",1],
        ["alive",2],
    ];
    let exceptionLength = 0;
    let baseWord = word;
    forceOverrides.map(function(item) {
        let split = baseWord.split(item[0]);
        if (split.length > 1) {
            exceptionLength += (split.length-1) * item[1];
            baseWord = split.filter(i => (i !== "")).join("");
        }
    });
    // if(word.length <= 3) { return 1; }                             //return 1 if word.length <= 3
    baseWord = baseWord.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');   //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    baseWord = baseWord.replace(/^y/, '');                                 //word.sub!(/^y/, '')
    let match = baseWord.match(/[aeiouy]{1,2}/g);                    //word.scan(/[aeiouy]{1,2}/).size
    let baseSyllMatch = (match) ? match.length : 0;
    return (baseSyllMatch + exceptionLength) || 1;
}
