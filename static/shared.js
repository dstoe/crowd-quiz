QuizRenderer = function(topElementSelector) {
	var topElem = $(topElementSelector);
	if(!topElem.length) {
		throw "QuizRenderer: could not find topElement with selector " + topElementSelector;
	}

	var that = this;
	var revealed = false;
	
	this.renderQuestion = function(question, clickcallback) {
		revealed = false;
		topElem.empty().append($("<div>").attr("id", "questiontext").text(question.text));

		if(question.image) {
			var canvas = $("<canvas>");
			topElem.append(canvas.attr("id", "questionimage").css("display", "block"));
			var img = new Image();
			img.onload = function() {
				canvas.attr("width", img.width).attr("height", img.height);
				var ctx = canvas[0].getContext("2d");
				ctx.drawImage(img,0,0);
			};			
			img.src = question.image;

			if(clickcallback) {
				canvas.click(function(evt) {
					if(revealed) return;

					var x = evt.pageX - canvas[0].offsetLeft;
					var y = evt.pageY - canvas[0].offsetTop;

					var click = {
						clicktype: "imageclick",
						clickX: x,
						clickY: y
					};
					clickcallback(click);
				});
			}
		}

		if(question.options && question.options.length) {
			var optionlist = $("<ul>").attr("id", "optionlist");
			topElem.append(optionlist);

			// generate entries of option list
			for(var i = 0; i < question.options.length; ++i) {
				optionlist.append($("<li>").attr("id", "option" + i).toggleClass("option", true));
			}

			// display answering options in random order
			var permute = [];
			for(var i = 0; i < question.options.length; ++i) {
				var idx = 0;
				while(true) {
					var rand = Math.floor(Math.random() * question.options.length);
					if(!permute[rand]) {
						idx = rand;
						permute[idx] = true;
						break;
					}
				}

				var option = $("#option" + idx).text(question.options[i]).data("originalindex", i);
				var count = $("<span>").attr("id", "optioncount" + idx).toggleClass("optioncount", true);
				option.append(count);

				if(clickcallback) {
					option.click(function() {
						if(revealed) return;

						$("li.option").toggleClass("selected", false);		
						var option = $(this).toggleClass("selected", true);
						var click = {
							clicktype: "optionclick",
							clickedoption: option.data("originalindex")
						};
						clickcallback(click);
					});
				}
			}
		}

	}


	this.markImagePosition = function(x, y) {
		var canvas = $("#questionimage");
		var ctx = canvas[0].getContext("2d");
		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#003300';
		ctx.stroke();
	}

	this.reveal = function(votes) {
		revealed = true;

		for(var i = 0; i < 999; ++i) {
			var option = $("#option" + i);
			if(!option.length) {
				break;
			}

			var originalidx = option.data("originalindex");
			option.toggleClass("correct", originalidx == 0);
			option.toggleClass("incorrect", originalidx != 0);

			if(votes) {
				var optioncount = $("#optioncount" + i);
				var count = 0;
				for(var key in votes) {
					if(originalidx === votes[key]) {
						count++;
					}
				}
				optioncount.text(count + "");
			}

		}
	}

	this.isRevealed = function() {
		return revealed;
	}

}

QuizHolder = function(questions) {
	var quest = questions;
	var pos = 0;


	this.size = function() {
		return quest.length;
	}

	this.position = function() {
		return pos;
	}

	this.current = function() {
		return quest[pos];
	}

	this.hasNext = function() {
		return pos < (quest.length - 1);
	}

	this.next = function() {
		if(this.hasNext()) {
			pos++;
		}
		return this.current();
	}

	this.hasPrev = function() {
		return this.size() > 0 && pos > 0;
	}

	this.prev = function() {
		if(this.hasPrev()) {
			pos--;
		}
		return this.current();
	}
}

QuizUtil = {
	randomString: function() {
		var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var result = "";
		for (var i = 32; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	},

	permaId: function() {
		var id = localStorage.getItem("CrowdQuizId");
		if(!id) {
			id = QuizUtil.randomString();
			localStorage.setItem("CrowdQuizId", id);
		}
		return id;
	}
}
