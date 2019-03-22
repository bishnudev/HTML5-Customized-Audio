function devMusicPlayer(elementId, datasource=null, externalvolumeslider=false){
	var _this = this; // creating instance of this

	this.elementId = elementId;
	this.$mainElement = $('#'+this.elementId); // identifier starting with $ represents jquery element

	// instantiating elements
	this.$mainElement.addClass('customMediaPlayer');
	this.$mainElement.addClass('d-flex');

	// adding required elements inside parent
	let innerElementsHtml = '<div class="playerActionButton item p-2" id="'+this.elementId+'PlayButton"><span id="'+this.elementId+'PlayButtonIcon" class="fas">&#xf04b;</span></div><div class="playerProgressBar item p-2 flex-grow-1"><div id="'+this.elementId+'Slider"></div></div><audio id="'+this.elementId+'Main" preload="metadata" hidden><source src="musics/a.mp3" type="audio/mpeg"></audio>';
	this.$mainElement.append(innerElementsHtml);

	// declaring variables / jquery
	this.$slider = $('#'+this.elementId+'Slider'); // jquery-ui slider. simulates music progress bar
	this.$playButtonElement = $('#'+this.elementId+"PlayButton");

	// declaring variables / js
	this.audioElement = document.getElementById(this.elementId+'Main'); // actual html5 audio element
	this.playButtonElement = document.getElementById(this.elementId+"PlayButton"); // play button element
	this.playButtonIconElement = document.getElementById(this.elementId+'PlayButtonIcon'); // play button icon element
	if (datasource != null){
		this.dataSrc = datasource;
		this.audioElement.src = this.dataSrc;
	} else {
		this.dataSrc = '';
	}
	this.metadataloaded = false;
	this.duration;
	this.startTime = this.audioElement.currentTime;

	// loading data
	this.audioElement.load();
	this.audioElement.onloadedmetadata = function(){
		_this.duration = this.duration;
		_this.metadataloaded = true;
	}

	// instantiating slider element
	this.$slider.slider({
      	orientation: "horizontal",
      	range: "min",
      	max: 100,
      	value: this.startTime,
      	step:0.1,
      	change: function(e){
      		let changeBy = parseInt(_this.$slider.slider('option','value'));
      		if (e.originalEvent){
      			if (_this.isPlaying() == true){
      				_this.pause();
	      			_this.setCurrentTime(changeBy);
	      			_this.play();
      			} else {
      				_this.setCurrentTime(changeBy);
      			}
      		}
      	},
	});

	// requried methods
	this.$playButtonElement.click(function(){
		if (_this.isPlaying() == true){
			_this.pause();
		} else {
			_this.play();
		}
	});

	// updating pseudoplayer slider according to the real player
	this.audioElement.ontimeupdate = function(event){
		if (_this.isPlaying() == true){
			_this.updateSlider();
		}
	}

	// when audio completes playing
	this.audioElement.onended = function(){
		_this.updatePlayerIcon();
	}

	// methods
	this.play = function(newSrc){
		if (!newSrc){
			this.audioElement.play();
		} else {
			this.dataSrc = newSrc;
			this.audioElement.src = this.dataSrc;
			this.audioElement.load();
			this.audioElement.play();
		}
		this.updatePlayerIcon();
	}

	this.pause = function(){
		this.audioElement.pause();
		this.updatePlayerIcon();
	}

	this.updatePlayerIcon = function() {
		if (this.isPlaying() != true){
			this.playButtonIconElement.innerHTML = '&#xf04b;';
		} else {
			this.playButtonIconElement.innerHTML = '&#xf04c;';
		}
	}

	this.isPlaying = function () {
		if (this.audioElement.paused == true){
			return false;
		} else {
			return true;
		}
	}

	this.setSrc = function(dataSrc){
		if (!dataSrc){
			console.log('setSrc function requires one parameter');
		} else {
			this.dataSrc = dataSrc; // likely to be modified with more features
		}
	}

	this.setCurrentTime = function(percent){
		if (this.metadataloaded == true){
			let duration = this.duration;
			let newTime = parseInt(percent/100 * duration);
			this.audioElement.currentTime = newTime;
			this.updateSlider();
		} else {
			this.audioElement.onloadedmetadata = function(){
				_this.duration = this.duration;
				_this.metadataloaded = true;
				let duration = this.duration;
				let newTime = parseInt(percent/100 * duration);
				this.currentTime = newTime;
				_this.updateSlider();
			};
		}
	}

	this.getCurrentTime = function(){
		return this.audioElement.currentTime;
	}

	this.getDuration = function(){
		if (this.metadataloaded == true){
			return this.duration;
		} else {
			this.audioElement.onloadedmetadata = function(){
				_this.duration = this.duration;
				_this.metadataloaded = true;
				return this.duration;
			}
		}
	}

	this.load = function(){
		this.audioElement.load();
	}

	this.updateSlider = function(){
		let currentTime = this.getCurrentTime();
		let percent = this.timeToPercent(currentTime);
		this.$slider.slider('option', 'value', percent);
	}

	this.timeToPercent = function(time){
		let duration = this.getDuration();
		return (time/duration)*100;
	}
}

function devMusicPlayerVolume(elementId, playerId){
	var _this = this; // creating an instance of this

	// if elementId or playerId not set
	if (arguments.length != 2){
		console.log('This function expects two parameters.');
	} else {
		// declaring variables / js
		this.elementId = elementId; // volume slider main element
		this.playerId = playerId; // the player this volume slider has been binded to
		this.audioElement = document.getElementById(this.playerId+'Main'); // actual html5 audio element
		this.volume = this.audioElement.volume; // between 0 to 1

		this.$mainElement = $('#'+this.elementId); // identifier with $ represents jquery element


		// instantiating elements
		this.$mainElement.addClass('musicPlayerVolumeManager');

		// elements to add inside main
		let newElements = '<div id="'+this.elementId+'Slider"></div>';
		this.$mainElement.append(newElements);

		// slider for the volume
		this.$volumeSlider = $('#'+this.elementId+'Slider');

		// instantiating slider element
		this.$volumeSlider.slider({
	      	orientation: "horizontal",
	      	range: "min",
	      	max: 1,
	      	value: this.volume,
	      	step: 0.1,
	      	change: function(e){
	      		let changeBy = _this.$volumeSlider.slider('option','value');
	      		if (e.originalEvent){
	      			_this.setVolume(changeBy);
	      		}
	      	}
		});

		// if original audio element volume has been changed
		this.audioElement.onvolumechange = function(e){
			if (e.isTrusted == true){
				_this.setVolume(this.volume);
			}
		}

		// methods
		this.setVolume = function(value){
			this.audioElement.volume = value;
		}

		this.getVolume = function(){
			return this.audioElement.volume;
		}
	}
}