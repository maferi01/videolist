/*! @name videojs-playlist-ui @version 3.7.0 @license Apache-2.0 */
(function (QUnit,videojs) {
	'use strict';

	QUnit = QUnit && QUnit.hasOwnProperty('default') ? QUnit['default'] : QUnit;
	videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var minDoc = {};

	var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
	    typeof window !== 'undefined' ? window : {};


	var doccy;

	if (typeof document !== 'undefined') {
	    doccy = document;
	} else {
	    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

	    if (!doccy) {
	        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
	    }
	}

	var document_1 = doccy;

	var win;

	if (typeof window !== "undefined") {
	    win = window;
	} else if (typeof commonjsGlobal !== "undefined") {
	    win = commonjsGlobal;
	} else if (typeof self !== "undefined"){
	    win = self;
	} else {
	    win = {};
	}

	var window_1 = win;

	/*! @name videojs-playlist @version 4.3.1 @license Apache-2.0 */

	/**
	 * Validates a number of seconds to use as the auto-advance delay.
	 *
	 * @private
	 * @param   {number} s
	 *          The number to check
	 *
	 * @return  {boolean}
	 *          Whether this is a valid second or not
	 */
	var validSeconds = function validSeconds(s) {
	  return typeof s === 'number' && !isNaN(s) && s >= 0 && s < Infinity;
	};
	/**
	 * Resets the auto-advance behavior of a player.
	 *
	 * @param {Player} player
	 *        The player to reset the behavior on
	 */


	var reset = function reset(player) {
	  var aa = player.playlist.autoadvance_;

	  if (aa.timeout) {
	    player.clearTimeout(aa.timeout);
	  }

	  if (aa.trigger) {
	    player.off('ended', aa.trigger);
	  }

	  aa.timeout = null;
	  aa.trigger = null;
	};
	/**
	 * Sets up auto-advance behavior on a player.
	 *
	 * @param  {Player} player
	 *         the current player
	 *
	 * @param  {number} delay
	 *         The number of seconds to wait before each auto-advance.
	 *
	 * @return {undefined}
	 *         Used to short circuit function logic
	 */


	var setup = function setup(player, delay) {
	  reset(player); // Before queuing up new auto-advance behavior, check if `seconds` was
	  // called with a valid value.

	  if (!validSeconds(delay)) {
	    player.playlist.autoadvance_.delay = null;
	    return;
	  }

	  player.playlist.autoadvance_.delay = delay;

	  player.playlist.autoadvance_.trigger = function () {
	    // This calls setup again, which will reset the existing auto-advance and
	    // set up another auto-advance for the next "ended" event.
	    var cancelOnPlay = function cancelOnPlay() {
	      return setup(player, delay);
	    }; // If there is a "play" event while we're waiting for an auto-advance,
	    // we need to cancel the auto-advance. This could mean the user seeked
	    // back into the content or restarted the content. This is reproducible
	    // with an auto-advance > 0.


	    player.one('play', cancelOnPlay);
	    player.playlist.autoadvance_.timeout = player.setTimeout(function () {
	      reset(player);
	      player.off('play', cancelOnPlay);
	      player.playlist.next();
	    }, delay * 1000);
	  };

	  player.one('ended', player.playlist.autoadvance_.trigger);
	};

	/**
	 * Removes all remote text tracks from a player.
	 *
	 * @param  {Player} player
	 *         The player to clear tracks on
	 */

	var clearTracks = function clearTracks(player) {
	  var tracks = player.remoteTextTracks();
	  var i = tracks && tracks.length || 0; // This uses a `while` loop rather than `forEach` because the
	  // `TextTrackList` object is a live DOM list (not an array).

	  while (i--) {
	    player.removeRemoteTextTrack(tracks[i]);
	  }
	};
	/**
	 * Plays an item on a player's playlist.
	 *
	 * @param  {Player} player
	 *         The player to play the item on
	 *
	 * @param  {Object} item
	 *         A source from the playlist.
	 *
	 * @return {Player}
	 *         The player that is now playing the item
	 */


	var playItem = function playItem(player, item) {
	  var replay = !player.paused() || player.ended();
	  player.trigger('beforeplaylistitem', item.originalValue || item);

	  if (item.playlistItemId_) {
	    player.playlist.currentPlaylistItemId_ = item.playlistItemId_;
	  }

	  player.poster(item.poster || '');
	  player.src(item.sources);
	  clearTracks(player);
	  player.ready(function () {
	    (item.textTracks || []).forEach(player.addRemoteTextTrack.bind(player));
	    player.trigger('playlistitem', item.originalValue || item);

	    if (replay) {
	      var playPromise = player.play(); // silence error when a pause interrupts a play request
	      // on browsers which return a promise

	      if (typeof playPromise !== 'undefined' && typeof playPromise.then === 'function') {
	        playPromise.then(null, function (e) {});
	      }
	    }

	    setup(player, player.playlist.autoadvance_.delay);
	  });
	  return player;
	};

	/**
	 * Returns whether a playlist item is an object of any kind, excluding null.
	 *
	 * @private
	 *
	 * @param {Object}
	 *         value to be checked
	 *
	 * @return {boolean}
	 *          The result
	 */

	var isItemObject = function isItemObject(value) {
	  return !!value && typeof value === 'object';
	};
	/**
	 * Look through an array of playlist items and transform any primitive
	 * as well as null values to objects. This method also adds a property
	 * to the transformed item containing original value passed in an input list.
	 *
	 * @private
	 *
	 * @param  {Array} arr
	 *         An array of playlist items
	 *
	 * @return {Array}
	 *         A new array with transformed items
	 */


	var transformPrimitiveItems = function transformPrimitiveItems(arr) {
	  var list = [];
	  var tempItem;
	  arr.forEach(function (item) {
	    if (!isItemObject(item)) {
	      tempItem = Object(item);
	      tempItem.originalValue = item;
	    } else {
	      tempItem = item;
	    }

	    list.push(tempItem);
	  });
	  return list;
	};
	/**
	 * Generate a unique id for each playlist item object. This id will be used to determine
	 * index of an item in the playlist array for cases where there are multiple items with
	 * the same source set.
	 *
	 * @private
	 *
	 * @param  {Array} arr
	 *         An array of playlist items
	 */


	var generatePlaylistItemId = function generatePlaylistItemId(arr) {
	  var guid = 1;
	  arr.forEach(function (item) {
	    item.playlistItemId_ = guid++;
	  });
	};
	/**
	 * Look through an array of playlist items for a specific playlist item id.
	 *
	 * @private
	 * @param   {Array} list
	 *          An array of playlist items to look through
	 *
	 * @param   {number} currentItemId
	 *          The current item ID.
	 *
	 * @return  {number}
	 *          The index of the playlist item or -1 if not found
	 */


	var indexInPlaylistItemIds = function indexInPlaylistItemIds(list, currentItemId) {
	  for (var i = 0; i < list.length; i++) {
	    if (list[i].playlistItemId_ === currentItemId) {
	      return i;
	    }
	  }

	  return -1;
	};
	/**
	 * Given two sources, check to see whether the two sources are equal.
	 * If both source urls have a protocol, the protocols must match, otherwise, protocols
	 * are ignored.
	 *
	 * @private
	 * @param {string|Object} source1
	 *        The first source
	 *
	 * @param {string|Object} source2
	 *        The second source
	 *
	 * @return {boolean}
	 *         The result
	 */


	var sourceEquals = function sourceEquals(source1, source2) {
	  var src1 = source1;
	  var src2 = source2;

	  if (typeof source1 === 'object') {
	    src1 = source1.src;
	  }

	  if (typeof source2 === 'object') {
	    src2 = source2.src;
	  }

	  if (/^\/\//.test(src1)) {
	    src2 = src2.slice(src2.indexOf('//'));
	  }

	  if (/^\/\//.test(src2)) {
	    src1 = src1.slice(src1.indexOf('//'));
	  }

	  return src1 === src2;
	};
	/**
	 * Look through an array of playlist items for a specific `source`;
	 * checking both the value of elements and the value of their `src`
	 * property.
	 *
	 * @private
	 * @param   {Array} arr
	 *          An array of playlist items to look through
	 *
	 * @param   {string} src
	 *          The source to look for
	 *
	 * @return  {number}
	 *          The index of that source or -1
	 */


	var indexInSources = function indexInSources(arr, src) {
	  for (var i = 0; i < arr.length; i++) {
	    var sources = arr[i].sources;

	    if (Array.isArray(sources)) {
	      for (var j = 0; j < sources.length; j++) {
	        var source = sources[j];

	        if (source && sourceEquals(source, src)) {
	          return i;
	        }
	      }
	    }
	  }

	  return -1;
	};
	/**
	 * Randomize the contents of an array.
	 *
	 * @private
	 * @param  {Array} arr
	 *         An array.
	 *
	 * @return {Array}
	 *         The same array that was passed in.
	 */


	var randomize = function randomize(arr) {
	  var index = -1;
	  var lastIndex = arr.length - 1;

	  while (++index < arr.length) {
	    var rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
	    var value = arr[rand];
	    arr[rand] = arr[index];
	    arr[index] = value;
	  }

	  return arr;
	};
	/**
	 * Factory function for creating new playlist implementation on the given player.
	 *
	 * API summary:
	 *
	 * playlist(['a', 'b', 'c']) // setter
	 * playlist() // getter
	 * playlist.currentItem() // getter, 0
	 * playlist.currentItem(1) // setter, 1
	 * playlist.next() // 'c'
	 * playlist.previous() // 'b'
	 * playlist.first() // 'a'
	 * playlist.last() // 'c'
	 * playlist.autoadvance(5) // 5 second delay
	 * playlist.autoadvance() // cancel autoadvance
	 *
	 * @param  {Player} player
	 *         The current player
	 *
	 * @param  {Array=} initialList
	 *         If given, an initial list of sources with which to populate
	 *         the playlist.
	 *
	 * @param  {number=}  initialIndex
	 *         If given, the index of the item in the list that should
	 *         be loaded first. If -1, no video is loaded. If omitted, The
	 *         the first video is loaded.
	 *
	 * @return {Function}
	 *         Returns the playlist function specific to the given player.
	 */


	function factory(player, initialList, initialIndex) {
	  if (initialIndex === void 0) {
	    initialIndex = 0;
	  }

	  var list = null;
	  var changing = false;
	  /**
	   * Get/set the playlist for a player.
	   *
	   * This function is added as an own property of the player and has its
	   * own methods which can be called to manipulate the internal state.
	   *
	   * @param  {Array} [newList]
	   *         If given, a new list of sources with which to populate the
	   *         playlist. Without this, the function acts as a getter.
	   *
	   * @param  {number}  [newIndex]
	   *         If given, the index of the item in the list that should
	   *         be loaded first. If -1, no video is loaded. If omitted, The
	   *         the first video is loaded.
	   *
	   * @return {Array}
	   *         The playlist
	   */

	  var playlist = player.playlist = function (newList, newIndex) {
	    if (newIndex === void 0) {
	      newIndex = 0;
	    }

	    if (changing) {
	      throw new Error('do not call playlist() during a playlist change');
	    }

	    if (Array.isArray(newList)) {
	      // @todo - Simplify this to `list.slice()` for v5.
	      var previousPlaylist = Array.isArray(list) ? list.slice() : null;
	      var nextPlaylist = newList.slice();
	      list = nextPlaylist.slice(); // Transform any primitive and null values in an input list to objects

	      if (list.filter(function (item) {
	        return isItemObject(item);
	      }).length !== list.length) {
	        list = transformPrimitiveItems(list);
	      } // Add unique id to each playlist item. This id will be used
	      // to determine index in cases where there are more than one
	      // identical sources in the playlist.


	      generatePlaylistItemId(list); // Mark the playlist as changing during the duringplaylistchange lifecycle.

	      changing = true;
	      player.trigger({
	        type: 'duringplaylistchange',
	        nextIndex: newIndex,
	        nextPlaylist: nextPlaylist,
	        previousIndex: playlist.currentIndex_,
	        // @todo - Simplify this to simply pass along `previousPlaylist` for v5.
	        previousPlaylist: previousPlaylist || []
	      });
	      changing = false;

	      if (newIndex !== -1) {
	        playlist.currentItem(newIndex);
	      } // The only time the previous playlist is null is the first call to this
	      // function. This allows us to fire the `duringplaylistchange` event
	      // every time the playlist is populated and to maintain backward
	      // compatibility by not firing the `playlistchange` event on the initial
	      // population of the list.
	      //
	      // @todo - Remove this condition in preparation for v5.


	      if (previousPlaylist) {
	        player.setTimeout(function () {
	          player.trigger('playlistchange');
	        }, 0);
	      }
	    } // Always return a shallow clone of the playlist list.
	    //  We also want to return originalValue if any item in the list has it.


	    return list.map(function (item) {
	      return item.originalValue || item;
	    }).slice();
	  }; // On a new source, if there is no current item, disable auto-advance.


	  player.on('loadstart', function () {
	    if (playlist.currentItem() === -1) {
	      reset(player);
	    }
	  });
	  playlist.currentIndex_ = -1;
	  playlist.player_ = player;
	  playlist.autoadvance_ = {};
	  playlist.repeat_ = false;
	  playlist.currentPlaylistItemId_ = null;
	  /**
	   * Get or set the current item in the playlist.
	   *
	   * During the duringplaylistchange event, acts only as a getter.
	   *
	   * @param  {number} [index]
	   *         If given as a valid value, plays the playlist item at that index.
	   *
	   * @return {number}
	   *         The current item index.
	   */

	  playlist.currentItem = function (index) {
	    // If the playlist is changing, only act as a getter.
	    if (changing) {
	      return playlist.currentIndex_;
	    } // Act as a setter when the index is given and is a valid number.


	    if (typeof index === 'number' && playlist.currentIndex_ !== index && index >= 0 && index < list.length) {
	      playlist.currentIndex_ = index;
	      playItem(playlist.player_, list[playlist.currentIndex_]);
	      return playlist.currentIndex_;
	    }

	    var src = playlist.player_.currentSrc() || ''; // If there is a currentPlaylistItemId_, validate that it matches the
	    // current source URL returned by the player. This is sufficient evidence
	    // to suggest that the source was set by the playlist plugin. This code
	    // exists primarily to deal with playlists where multiple items have the
	    // same source.

	    if (playlist.currentPlaylistItemId_) {
	      var indexInItemIds = indexInPlaylistItemIds(list, playlist.currentPlaylistItemId_);
	      var item = list[indexInItemIds]; // Found a match, this is our current index!

	      if (item && Array.isArray(item.sources) && indexInSources([item], src) > -1) {
	        playlist.currentIndex_ = indexInItemIds;
	        return playlist.currentIndex_;
	      } // If this does not match the current source, null it out so subsequent
	      // calls can skip this step.


	      playlist.currentPlaylistItemId_ = null;
	    } // Finally, if we don't have a valid, current playlist item ID, we can
	    // auto-detect it based on the player's current source URL.


	    playlist.currentIndex_ = playlist.indexOf(src);
	    return playlist.currentIndex_;
	  };
	  /**
	   * Checks if the playlist contains a value.
	   *
	   * @param  {string|Object|Array} value
	   *         The value to check
	   *
	   * @return {boolean}
	   *         The result
	   */


	  playlist.contains = function (value) {
	    return playlist.indexOf(value) !== -1;
	  };
	  /**
	   * Gets the index of a value in the playlist or -1 if not found.
	   *
	   * @param  {string|Object|Array} value
	   *         The value to find the index of
	   *
	   * @return {number}
	   *         The index or -1
	   */


	  playlist.indexOf = function (value) {
	    if (typeof value === 'string') {
	      return indexInSources(list, value);
	    }

	    var sources = Array.isArray(value) ? value : value.sources;

	    for (var i = 0; i < sources.length; i++) {
	      var source = sources[i];

	      if (typeof source === 'string') {
	        return indexInSources(list, source);
	      } else if (source.src) {
	        return indexInSources(list, source.src);
	      }
	    }

	    return -1;
	  };
	  /**
	   * Get the index of the current item in the playlist. This is identical to
	   * calling `currentItem()` with no arguments.
	   *
	   * @return {number}
	   *         The current item index.
	   */


	  playlist.currentIndex = function () {
	    return playlist.currentItem();
	  };
	  /**
	   * Get the index of the last item in the playlist.
	   *
	   * @return {number}
	   *         The index of the last item in the playlist or -1 if there are no
	   *         items.
	   */


	  playlist.lastIndex = function () {
	    return list.length - 1;
	  };
	  /**
	   * Get the index of the next item in the playlist.
	   *
	   * @return {number}
	   *         The index of the next item in the playlist or -1 if there is no
	   *         current item.
	   */


	  playlist.nextIndex = function () {
	    var current = playlist.currentItem();

	    if (current === -1) {
	      return -1;
	    }

	    var lastIndex = playlist.lastIndex(); // When repeating, loop back to the beginning on the last item.

	    if (playlist.repeat_ && current === lastIndex) {
	      return 0;
	    } // Don't go past the end of the playlist.


	    return Math.min(current + 1, lastIndex);
	  };
	  /**
	   * Get the index of the previous item in the playlist.
	   *
	   * @return {number}
	   *         The index of the previous item in the playlist or -1 if there is
	   *         no current item.
	   */


	  playlist.previousIndex = function () {
	    var current = playlist.currentItem();

	    if (current === -1) {
	      return -1;
	    } // When repeating, loop back to the end of the playlist.


	    if (playlist.repeat_ && current === 0) {
	      return playlist.lastIndex();
	    } // Don't go past the beginning of the playlist.


	    return Math.max(current - 1, 0);
	  };
	  /**
	   * Plays the first item in the playlist.
	   *
	   * @return {Object|undefined}
	   *         Returns undefined and has no side effects if the list is empty.
	   */


	  playlist.first = function () {
	    if (changing) {
	      return;
	    }

	    var newItem = playlist.currentItem(0);

	    if (list.length) {
	      return list[newItem].originalValue || list[newItem];
	    }

	    playlist.currentIndex_ = -1;
	  };
	  /**
	   * Plays the last item in the playlist.
	   *
	   * @return {Object|undefined}
	   *         Returns undefined and has no side effects if the list is empty.
	   */


	  playlist.last = function () {
	    if (changing) {
	      return;
	    }

	    var newItem = playlist.currentItem(playlist.lastIndex());

	    if (list.length) {
	      return list[newItem].originalValue || list[newItem];
	    }

	    playlist.currentIndex_ = -1;
	  };
	  /**
	   * Plays the next item in the playlist.
	   *
	   * @return {Object|undefined}
	   *         Returns undefined and has no side effects if on last item.
	   */


	  playlist.next = function () {
	    if (changing) {
	      return;
	    }

	    var index = playlist.nextIndex();

	    if (index !== playlist.currentIndex_) {
	      var newItem = playlist.currentItem(index);
	      return list[newItem].originalValue || list[newItem];
	    }
	  };
	  /**
	   * Plays the previous item in the playlist.
	   *
	   * @return {Object|undefined}
	   *         Returns undefined and has no side effects if on first item.
	   */


	  playlist.previous = function () {
	    if (changing) {
	      return;
	    }

	    var index = playlist.previousIndex();

	    if (index !== playlist.currentIndex_) {
	      var newItem = playlist.currentItem(index);
	      return list[newItem].originalValue || list[newItem];
	    }
	  };
	  /**
	   * Set up auto-advance on the playlist.
	   *
	   * @param  {number} [delay]
	   *         The number of seconds to wait before each auto-advance.
	   */


	  playlist.autoadvance = function (delay) {
	    setup(playlist.player_, delay);
	  };
	  /**
	   * Sets `repeat` option, which makes the "next" video of the last video in
	   * the playlist be the first video in the playlist.
	   *
	   * @param  {boolean} [val]
	   *         The value to set repeat to
	   *
	   * @return {boolean}
	   *         The current value of repeat
	   */


	  playlist.repeat = function (val) {
	    if (val === undefined) {
	      return playlist.repeat_;
	    }

	    if (typeof val !== 'boolean') {
	      videojs.log.error('videojs-playlist: Invalid value for repeat', val);
	      return;
	    }

	    playlist.repeat_ = !!val;
	    return playlist.repeat_;
	  };
	  /**
	   * Sorts the playlist array.
	   *
	   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
	   * @fires playlistsorted
	   *
	   * @param {Function} compare
	   *        A comparator function as per the native Array method.
	   */


	  playlist.sort = function (compare) {
	    // Bail if the array is empty.
	    if (!list.length) {
	      return;
	    }

	    list.sort(compare); // If the playlist is changing, don't trigger events.

	    if (changing) {
	      return;
	    }
	    /**
	     * Triggered after the playlist is sorted internally.
	     *
	     * @event playlistsorted
	     * @type {Object}
	     */


	    player.trigger('playlistsorted');
	  };
	  /**
	   * Reverses the playlist array.
	   *
	   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse}
	   * @fires playlistsorted
	   */


	  playlist.reverse = function () {
	    // Bail if the array is empty.
	    if (!list.length) {
	      return;
	    }

	    list.reverse(); // If the playlist is changing, don't trigger events.

	    if (changing) {
	      return;
	    }
	    /**
	     * Triggered after the playlist is sorted internally.
	     *
	     * @event playlistsorted
	     * @type {Object}
	     */


	    player.trigger('playlistsorted');
	  };
	  /**
	   * Shuffle the contents of the list randomly.
	   *
	   * @see   {@link https://github.com/lodash/lodash/blob/40e096b6d5291a025e365a0f4c010d9a0efb9a69/shuffle.js}
	   * @fires playlistsorted
	   * @todo  Make the `rest` option default to `true` in v5.0.0.
	   * @param {Object} [options]
	   *        An object containing shuffle options.
	   *
	   * @param {boolean} [options.rest = false]
	   *        By default, the entire playlist is randomized. However, this may
	   *        not be desirable in all cases, such as when a user is already
	   *        watching a video.
	   *
	   *        When `true` is passed for this option, it will only shuffle
	   *        playlist items after the current item. For example, when on the
	   *        first item, will shuffle the second item and beyond.
	   */


	  playlist.shuffle = function (_temp) {
	    var _ref = _temp === void 0 ? {} : _temp,
	        rest = _ref.rest;

	    var index = 0;
	    var arr = list; // When options.rest is true, start randomization at the item after the
	    // current item.

	    if (rest) {
	      index = playlist.currentIndex_ + 1;
	      arr = list.slice(index);
	    } // Bail if the array is empty or too short to shuffle.


	    if (arr.length <= 1) {
	      return;
	    }

	    randomize(arr); // When options.rest is true, splice the randomized sub-array back into
	    // the original array.

	    if (rest) {
	      var _list;

	      (_list = list).splice.apply(_list, [index, arr.length].concat(arr));
	    } // If the playlist is changing, don't trigger events.


	    if (changing) {
	      return;
	    }
	    /**
	     * Triggered after the playlist is sorted internally.
	     *
	     * @event playlistsorted
	     * @type {Object}
	     */


	    player.trigger('playlistsorted');
	  }; // If an initial list was given, populate the playlist with it.


	  if (Array.isArray(initialList)) {
	    playlist(initialList.slice(), initialIndex); // If there is no initial list given, silently set an empty array.
	  } else {
	    list = [];
	  }

	  return playlist;
	}

	var version = "4.3.1";

	var registerPlugin = videojs.registerPlugin || videojs.plugin;
	/**
	 * The video.js playlist plugin. Invokes the playlist-maker to create a
	 * playlist function on the specific player.
	 *
	 * @param {Array} list
	 *        a list of sources
	 *
	 * @param {number} item
	 *        The index to start at
	 */

	var plugin = function plugin(list, item) {
	  factory(this, list, item);
	};

	registerPlugin('playlist', plugin);
	plugin.VERSION = version;

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	var version$1 = "3.7.0";

	var cov_1wu0dhrxa3 = function () {
	  var path = '/Users/poneill/dev/videojs-playlist-ui/src/plugin.js',
	      hash = 'c07281726c622ffa84bc573d895975667d7055a8',
	      Function = function () {}.constructor,
	      global = new Function('return this')(),
	      gcv = '__coverage__',
	      coverageData = {
	    path: '/Users/poneill/dev/videojs-playlist-ui/src/plugin.js',
	    statementMap: {
	      '0': {
	        start: {
	          line: 5,
	          column: 12
	        },
	        end: {
	          line: 5,
	          column: 34
	        }
	      },
	      '1': {
	        start: {
	          line: 6,
	          column: 23
	        },
	        end: {
	          line: 6,
	          column: 63
	        }
	      },
	      '2': {
	        start: {
	          line: 9,
	          column: 16
	        },
	        end: {
	          line: 16,
	          column: 1
	        }
	      },
	      '3': {
	        start: {
	          line: 10,
	          column: 2
	        },
	        end: {
	          line: 14,
	          column: 3
	        }
	      },
	      '4': {
	        start: {
	          line: 11,
	          column: 4
	        },
	        end: {
	          line: 13,
	          column: 5
	        }
	      },
	      '5': {
	        start: {
	          line: 12,
	          column: 6
	        },
	        end: {
	          line: 12,
	          column: 15
	        }
	      },
	      '6': {
	        start: {
	          line: 15,
	          column: 2
	        },
	        end: {
	          line: 15,
	          column: 12
	        }
	      },
	      '7': {
	        start: {
	          line: 19,
	          column: 33
	        },
	        end: {
	          line: 24,
	          column: 4
	        }
	      },
	      '8': {
	        start: {
	          line: 20,
	          column: 18
	        },
	        end: {
	          line: 20,
	          column: 45
	        }
	      },
	      '9': {
	        start: {
	          line: 22,
	          column: 2
	        },
	        end: {
	          line: 22,
	          column: 48
	        }
	      },
	      '10': {
	        start: {
	          line: 23,
	          column: 2
	        },
	        end: {
	          line: 23,
	          column: 48
	        }
	      },
	      '11': {
	        start: {
	          line: 26,
	          column: 17
	        },
	        end: {
	          line: 30,
	          column: 1
	        }
	      },
	      '12': {
	        start: {
	          line: 35,
	          column: 25
	        },
	        end: {
	          line: 37,
	          column: 1
	        }
	      },
	      '13': {
	        start: {
	          line: 36,
	          column: 2
	        },
	        end: {
	          line: 36,
	          column: 30
	        }
	      },
	      '14': {
	        start: {
	          line: 38,
	          column: 28
	        },
	        end: {
	          line: 44,
	          column: 1
	        }
	      },
	      '15': {
	        start: {
	          line: 39,
	          column: 2
	        },
	        end: {
	          line: 39,
	          column: 33
	        }
	      },
	      '16': {
	        start: {
	          line: 41,
	          column: 2
	        },
	        end: {
	          line: 43,
	          column: 3
	        }
	      },
	      '17': {
	        start: {
	          line: 42,
	          column: 4
	        },
	        end: {
	          line: 42,
	          column: 62
	        }
	      },
	      '18': {
	        start: {
	          line: 46,
	          column: 15
	        },
	        end: {
	          line: 48,
	          column: 1
	        }
	      },
	      '19': {
	        start: {
	          line: 47,
	          column: 2
	        },
	        end: {
	          line: 47,
	          column: 29
	        }
	      },
	      '20': {
	        start: {
	          line: 49,
	          column: 18
	        },
	        end: {
	          line: 51,
	          column: 1
	        }
	      },
	      '21': {
	        start: {
	          line: 50,
	          column: 2
	        },
	        end: {
	          line: 50,
	          column: 32
	        }
	      },
	      '22': {
	        start: {
	          line: 53,
	          column: 24
	        },
	        end: {
	          line: 99,
	          column: 1
	        }
	      },
	      '23': {
	        start: {
	          line: 54,
	          column: 2
	        },
	        end: {
	          line: 59,
	          column: 3
	        }
	      },
	      '24': {
	        start: {
	          line: 55,
	          column: 24
	        },
	        end: {
	          line: 55,
	          column: 53
	        }
	      },
	      '25': {
	        start: {
	          line: 57,
	          column: 4
	        },
	        end: {
	          line: 57,
	          column: 88
	        }
	      },
	      '26': {
	        start: {
	          line: 58,
	          column: 4
	        },
	        end: {
	          line: 58,
	          column: 23
	        }
	      },
	      '27': {
	        start: {
	          line: 61,
	          column: 18
	        },
	        end: {
	          line: 61,
	          column: 51
	        }
	      },
	      '28': {
	        start: {
	          line: 63,
	          column: 2
	        },
	        end: {
	          line: 63,
	          column: 47
	        }
	      },
	      '29': {
	        start: {
	          line: 65,
	          column: 2
	        },
	        end: {
	          line: 97,
	          column: 3
	        }
	      },
	      '30': {
	        start: {
	          line: 67,
	          column: 16
	        },
	        end: {
	          line: 67,
	          column: 45
	        }
	      },
	      '31': {
	        start: {
	          line: 69,
	          column: 4
	        },
	        end: {
	          line: 69,
	          column: 24
	        }
	      },
	      '32': {
	        start: {
	          line: 70,
	          column: 4
	        },
	        end: {
	          line: 70,
	          column: 17
	        }
	      },
	      '33': {
	        start: {
	          line: 71,
	          column: 4
	        },
	        end: {
	          line: 71,
	          column: 29
	        }
	      },
	      '34': {
	        start: {
	          line: 77,
	          column: 4
	        },
	        end: {
	          line: 86,
	          column: 5
	        }
	      },
	      '35': {
	        start: {
	          line: 78,
	          column: 22
	        },
	        end: {
	          line: 78,
	          column: 34
	        }
	      },
	      '36': {
	        start: {
	          line: 79,
	          column: 21
	        },
	        end: {
	          line: 79,
	          column: 53
	        }
	      },
	      '37': {
	        start: {
	          line: 82,
	          column: 6
	        },
	        end: {
	          line: 84,
	          column: 7
	        }
	      },
	      '38': {
	        start: {
	          line: 83,
	          column: 8
	        },
	        end: {
	          line: 83,
	          column: 37
	        }
	      },
	      '39': {
	        start: {
	          line: 85,
	          column: 6
	        },
	        end: {
	          line: 85,
	          column: 34
	        }
	      },
	      '40': {
	        start: {
	          line: 89,
	          column: 20
	        },
	        end: {
	          line: 89,
	          column: 51
	        }
	      },
	      '41': {
	        start: {
	          line: 90,
	          column: 16
	        },
	        end: {
	          line: 90,
	          column: 45
	        }
	      },
	      '42': {
	        start: {
	          line: 92,
	          column: 4
	        },
	        end: {
	          line: 92,
	          column: 17
	        }
	      },
	      '43': {
	        start: {
	          line: 93,
	          column: 4
	        },
	        end: {
	          line: 95,
	          column: 5
	        }
	      },
	      '44': {
	        start: {
	          line: 94,
	          column: 6
	        },
	        end: {
	          line: 94,
	          column: 32
	        }
	      },
	      '45': {
	        start: {
	          line: 96,
	          column: 4
	        },
	        end: {
	          line: 96,
	          column: 29
	        }
	      },
	      '46': {
	        start: {
	          line: 98,
	          column: 2
	        },
	        end: {
	          line: 98,
	          column: 17
	        }
	      },
	      '47': {
	        start: {
	          line: 101,
	          column: 18
	        },
	        end: {
	          line: 101,
	          column: 51
	        }
	      },
	      '48': {
	        start: {
	          line: 106,
	          column: 4
	        },
	        end: {
	          line: 108,
	          column: 5
	        }
	      },
	      '49': {
	        start: {
	          line: 107,
	          column: 6
	        },
	        end: {
	          line: 107,
	          column: 84
	        }
	      },
	      '50': {
	        start: {
	          line: 110,
	          column: 4
	        },
	        end: {
	          line: 110,
	          column: 32
	        }
	      },
	      '51': {
	        start: {
	          line: 111,
	          column: 4
	        },
	        end: {
	          line: 111,
	          column: 34
	        }
	      },
	      '52': {
	        start: {
	          line: 113,
	          column: 4
	        },
	        end: {
	          line: 113,
	          column: 46
	        }
	      },
	      '53': {
	        start: {
	          line: 115,
	          column: 4
	        },
	        end: {
	          line: 115,
	          column: 25
	        }
	      },
	      '54': {
	        start: {
	          line: 117,
	          column: 4
	        },
	        end: {
	          line: 117,
	          column: 56
	        }
	      },
	      '55': {
	        start: {
	          line: 118,
	          column: 4
	        },
	        end: {
	          line: 118,
	          column: 44
	        }
	      },
	      '56': {
	        start: {
	          line: 125,
	          column: 4
	        },
	        end: {
	          line: 127,
	          column: 5
	        }
	      },
	      '57': {
	        start: {
	          line: 126,
	          column: 6
	        },
	        end: {
	          line: 126,
	          column: 33
	        }
	      },
	      '58': {
	        start: {
	          line: 131,
	          column: 4
	        },
	        end: {
	          line: 131,
	          column: 83
	        }
	      },
	      '59': {
	        start: {
	          line: 132,
	          column: 4
	        },
	        end: {
	          line: 134,
	          column: 5
	        }
	      },
	      '60': {
	        start: {
	          line: 133,
	          column: 6
	        },
	        end: {
	          line: 133,
	          column: 26
	        }
	      },
	      '61': {
	        start: {
	          line: 138,
	          column: 15
	        },
	        end: {
	          line: 138,
	          column: 43
	        }
	      },
	      '62': {
	        start: {
	          line: 139,
	          column: 17
	        },
	        end: {
	          line: 139,
	          column: 35
	        }
	      },
	      '63': {
	        start: {
	          line: 141,
	          column: 4
	        },
	        end: {
	          line: 149,
	          column: 5
	        }
	      },
	      '64': {
	        start: {
	          line: 142,
	          column: 23
	        },
	        end: {
	          line: 142,
	          column: 45
	        }
	      },
	      '65': {
	        start: {
	          line: 144,
	          column: 6
	        },
	        end: {
	          line: 148,
	          column: 9
	        }
	      },
	      '66': {
	        start: {
	          line: 145,
	          column: 22
	        },
	        end: {
	          line: 145,
	          column: 36
	        }
	      },
	      '67': {
	        start: {
	          line: 147,
	          column: 8
	        },
	        end: {
	          line: 147,
	          column: 32
	        }
	      },
	      '68': {
	        start: {
	          line: 151,
	          column: 4
	        },
	        end: {
	          line: 151,
	          column: 39
	        }
	      },
	      '69': {
	        start: {
	          line: 152,
	          column: 4
	        },
	        end: {
	          line: 152,
	          column: 35
	        }
	      },
	      '70': {
	        start: {
	          line: 155,
	          column: 4
	        },
	        end: {
	          line: 155,
	          column: 53
	        }
	      },
	      '71': {
	        start: {
	          line: 156,
	          column: 4
	        },
	        end: {
	          line: 156,
	          column: 35
	        }
	      },
	      '72': {
	        start: {
	          line: 159,
	          column: 4
	        },
	        end: {
	          line: 167,
	          column: 5
	        }
	      },
	      '73': {
	        start: {
	          line: 160,
	          column: 23
	        },
	        end: {
	          line: 160,
	          column: 53
	        }
	      },
	      '74': {
	        start: {
	          line: 161,
	          column: 19
	        },
	        end: {
	          line: 161,
	          column: 52
	        }
	      },
	      '75': {
	        start: {
	          line: 163,
	          column: 6
	        },
	        end: {
	          line: 163,
	          column: 51
	        }
	      },
	      '76': {
	        start: {
	          line: 164,
	          column: 6
	        },
	        end: {
	          line: 164,
	          column: 72
	        }
	      },
	      '77': {
	        start: {
	          line: 165,
	          column: 6
	        },
	        end: {
	          line: 165,
	          column: 58
	        }
	      },
	      '78': {
	        start: {
	          line: 166,
	          column: 6
	        },
	        end: {
	          line: 166,
	          column: 31
	        }
	      },
	      '79': {
	        start: {
	          line: 170,
	          column: 25
	        },
	        end: {
	          line: 170,
	          column: 55
	        }
	      },
	      '80': {
	        start: {
	          line: 171,
	          column: 27
	        },
	        end: {
	          line: 171,
	          column: 55
	        }
	      },
	      '81': {
	        start: {
	          line: 173,
	          column: 4
	        },
	        end: {
	          line: 173,
	          column: 61
	        }
	      },
	      '82': {
	        start: {
	          line: 174,
	          column: 4
	        },
	        end: {
	          line: 174,
	          column: 70
	        }
	      },
	      '83': {
	        start: {
	          line: 175,
	          column: 4
	        },
	        end: {
	          line: 175,
	          column: 55
	        }
	      },
	      '84': {
	        start: {
	          line: 176,
	          column: 4
	        },
	        end: {
	          line: 176,
	          column: 45
	        }
	      },
	      '85': {
	        start: {
	          line: 179,
	          column: 29
	        },
	        end: {
	          line: 179,
	          column: 58
	        }
	      },
	      '86': {
	        start: {
	          line: 181,
	          column: 4
	        },
	        end: {
	          line: 181,
	          column: 64
	        }
	      },
	      '87': {
	        start: {
	          line: 182,
	          column: 4
	        },
	        end: {
	          line: 182,
	          column: 49
	        }
	      },
	      '88': {
	        start: {
	          line: 185,
	          column: 21
	        },
	        end: {
	          line: 185,
	          column: 51
	        }
	      },
	      '89': {
	        start: {
	          line: 186,
	          column: 23
	        },
	        end: {
	          line: 186,
	          column: 47
	        }
	      },
	      '90': {
	        start: {
	          line: 188,
	          column: 4
	        },
	        end: {
	          line: 188,
	          column: 44
	        }
	      },
	      '91': {
	        start: {
	          line: 189,
	          column: 4
	        },
	        end: {
	          line: 189,
	          column: 62
	        }
	      },
	      '92': {
	        start: {
	          line: 190,
	          column: 4
	        },
	        end: {
	          line: 190,
	          column: 47
	        }
	      },
	      '93': {
	        start: {
	          line: 191,
	          column: 4
	        },
	        end: {
	          line: 191,
	          column: 43
	        }
	      },
	      '94': {
	        start: {
	          line: 194,
	          column: 20
	        },
	        end: {
	          line: 194,
	          column: 50
	        }
	      },
	      '95': {
	        start: {
	          line: 195,
	          column: 22
	        },
	        end: {
	          line: 195,
	          column: 66
	        }
	      },
	      '96': {
	        start: {
	          line: 197,
	          column: 4
	        },
	        end: {
	          line: 197,
	          column: 44
	        }
	      },
	      '97': {
	        start: {
	          line: 198,
	          column: 4
	        },
	        end: {
	          line: 198,
	          column: 60
	        }
	      },
	      '98': {
	        start: {
	          line: 199,
	          column: 4
	        },
	        end: {
	          line: 199,
	          column: 45
	        }
	      },
	      '99': {
	        start: {
	          line: 200,
	          column: 4
	        },
	        end: {
	          line: 200,
	          column: 42
	        }
	      },
	      '100': {
	        start: {
	          line: 202,
	          column: 4
	        },
	        end: {
	          line: 202,
	          column: 14
	        }
	      },
	      '101': {
	        start: {
	          line: 209,
	          column: 4
	        },
	        end: {
	          line: 211,
	          column: 5
	        }
	      },
	      '102': {
	        start: {
	          line: 210,
	          column: 6
	        },
	        end: {
	          line: 210,
	          column: 81
	        }
	      },
	      '103': {
	        start: {
	          line: 213,
	          column: 4
	        },
	        end: {
	          line: 213,
	          column: 27
	        }
	      },
	      '104': {
	        start: {
	          line: 214,
	          column: 4
	        },
	        end: {
	          line: 214,
	          column: 20
	        }
	      },
	      '105': {
	        start: {
	          line: 216,
	          column: 4
	        },
	        end: {
	          line: 220,
	          column: 5
	        }
	      },
	      '106': {
	        start: {
	          line: 217,
	          column: 6
	        },
	        end: {
	          line: 217,
	          column: 47
	        }
	      },
	      '107': {
	        start: {
	          line: 219,
	          column: 6
	        },
	        end: {
	          line: 219,
	          column: 45
	        }
	      },
	      '108': {
	        start: {
	          line: 225,
	          column: 4
	        },
	        end: {
	          line: 227,
	          column: 5
	        }
	      },
	      '109': {
	        start: {
	          line: 226,
	          column: 6
	        },
	        end: {
	          line: 226,
	          column: 44
	        }
	      },
	      '110': {
	        start: {
	          line: 229,
	          column: 4
	        },
	        end: {
	          line: 229,
	          column: 27
	        }
	      },
	      '111': {
	        start: {
	          line: 231,
	          column: 4
	        },
	        end: {
	          line: 233,
	          column: 5
	        }
	      },
	      '112': {
	        start: {
	          line: 232,
	          column: 6
	        },
	        end: {
	          line: 232,
	          column: 33
	        }
	      },
	      '113': {
	        start: {
	          line: 235,
	          column: 4
	        },
	        end: {
	          line: 237,
	          column: 7
	        }
	      },
	      '114': {
	        start: {
	          line: 236,
	          column: 6
	        },
	        end: {
	          line: 236,
	          column: 20
	        }
	      },
	      '115': {
	        start: {
	          line: 241,
	          column: 4
	        },
	        end: {
	          line: 243,
	          column: 7
	        }
	      },
	      '116': {
	        start: {
	          line: 242,
	          column: 6
	        },
	        end: {
	          line: 242,
	          column: 38
	        }
	      },
	      '117': {
	        start: {
	          line: 245,
	          column: 4
	        },
	        end: {
	          line: 247,
	          column: 7
	        }
	      },
	      '118': {
	        start: {
	          line: 246,
	          column: 6
	        },
	        end: {
	          line: 246,
	          column: 41
	        }
	      },
	      '119': {
	        start: {
	          line: 249,
	          column: 4
	        },
	        end: {
	          line: 252,
	          column: 7
	        }
	      },
	      '120': {
	        start: {
	          line: 250,
	          column: 6
	        },
	        end: {
	          line: 250,
	          column: 20
	        }
	      },
	      '121': {
	        start: {
	          line: 251,
	          column: 6
	        },
	        end: {
	          line: 251,
	          column: 33
	        }
	      },
	      '122': {
	        start: {
	          line: 254,
	          column: 4
	        },
	        end: {
	          line: 256,
	          column: 7
	        }
	      },
	      '123': {
	        start: {
	          line: 255,
	          column: 6
	        },
	        end: {
	          line: 255,
	          column: 21
	        }
	      },
	      '124': {
	        start: {
	          line: 260,
	          column: 4
	        },
	        end: {
	          line: 260,
	          column: 69
	        }
	      },
	      '125': {
	        start: {
	          line: 264,
	          column: 4
	        },
	        end: {
	          line: 267,
	          column: 5
	        }
	      },
	      '126': {
	        start: {
	          line: 265,
	          column: 6
	        },
	        end: {
	          line: 265,
	          column: 43
	        }
	      },
	      '127': {
	        start: {
	          line: 265,
	          column: 30
	        },
	        end: {
	          line: 265,
	          column: 41
	        }
	      },
	      '128': {
	        start: {
	          line: 266,
	          column: 6
	        },
	        end: {
	          line: 266,
	          column: 28
	        }
	      },
	      '129': {
	        start: {
	          line: 271,
	          column: 21
	        },
	        end: {
	          line: 271,
	          column: 50
	        }
	      },
	      '130': {
	        start: {
	          line: 272,
	          column: 15
	        },
	        end: {
	          line: 272,
	          column: 64
	        }
	      },
	      '131': {
	        start: {
	          line: 273,
	          column: 18
	        },
	        end: {
	          line: 273,
	          column: 68
	        }
	      },
	      '132': {
	        start: {
	          line: 275,
	          column: 4
	        },
	        end: {
	          line: 279,
	          column: 5
	        }
	      },
	      '133': {
	        start: {
	          line: 276,
	          column: 6
	        },
	        end: {
	          line: 276,
	          column: 42
	        }
	      },
	      '134': {
	        start: {
	          line: 277,
	          column: 6
	        },
	        end: {
	          line: 277,
	          column: 48
	        }
	      },
	      '135': {
	        start: {
	          line: 278,
	          column: 6
	        },
	        end: {
	          line: 278,
	          column: 33
	        }
	      },
	      '136': {
	        start: {
	          line: 281,
	          column: 4
	        },
	        end: {
	          line: 281,
	          column: 18
	        }
	      },
	      '137': {
	        start: {
	          line: 284,
	          column: 4
	        },
	        end: {
	          line: 291,
	          column: 5
	        }
	      },
	      '138': {
	        start: {
	          line: 285,
	          column: 19
	        },
	        end: {
	          line: 287,
	          column: 23
	        }
	      },
	      '139': {
	        start: {
	          line: 289,
	          column: 6
	        },
	        end: {
	          line: 289,
	          column: 28
	        }
	      },
	      '140': {
	        start: {
	          line: 290,
	          column: 6
	        },
	        end: {
	          line: 290,
	          column: 33
	        }
	      },
	      '141': {
	        start: {
	          line: 296,
	          column: 4
	        },
	        end: {
	          line: 303,
	          column: 5
	        }
	      },
	      '142': {
	        start: {
	          line: 297,
	          column: 6
	        },
	        end: {
	          line: 297,
	          column: 45
	        }
	      },
	      '143': {
	        start: {
	          line: 298,
	          column: 6
	        },
	        end: {
	          line: 298,
	          column: 52
	        }
	      },
	      '144': {
	        start: {
	          line: 299,
	          column: 6
	        },
	        end: {
	          line: 299,
	          column: 32
	        }
	      },
	      '145': {
	        start: {
	          line: 302,
	          column: 6
	        },
	        end: {
	          line: 302,
	          column: 32
	        }
	      },
	      '146': {
	        start: {
	          line: 306,
	          column: 26
	        },
	        end: {
	          line: 306,
	          column: 61
	        }
	      },
	      '147': {
	        start: {
	          line: 308,
	          column: 4
	        },
	        end: {
	          line: 316,
	          column: 5
	        }
	      },
	      '148': {
	        start: {
	          line: 309,
	          column: 6
	        },
	        end: {
	          line: 309,
	          column: 50
	        }
	      },
	      '149': {
	        start: {
	          line: 311,
	          column: 24
	        },
	        end: {
	          line: 311,
	          column: 78
	        }
	      },
	      '150': {
	        start: {
	          line: 313,
	          column: 6
	        },
	        end: {
	          line: 315,
	          column: 7
	        }
	      },
	      '151': {
	        start: {
	          line: 314,
	          column: 8
	        },
	        end: {
	          line: 314,
	          column: 60
	        }
	      },
	      '152': {
	        start: {
	          line: 321,
	          column: 21
	        },
	        end: {
	          line: 321,
	          column: 44
	        }
	      },
	      '153': {
	        start: {
	          line: 323,
	          column: 4
	        },
	        end: {
	          line: 328,
	          column: 5
	        }
	      },
	      '154': {
	        start: {
	          line: 326,
	          column: 6
	        },
	        end: {
	          line: 326,
	          column: 29
	        }
	      },
	      '155': {
	        start: {
	          line: 327,
	          column: 6
	        },
	        end: {
	          line: 327,
	          column: 13
	        }
	      },
	      '156': {
	        start: {
	          line: 330,
	          column: 4
	        },
	        end: {
	          line: 337,
	          column: 5
	        }
	      },
	      '157': {
	        start: {
	          line: 331,
	          column: 6
	        },
	        end: {
	          line: 336,
	          column: 7
	        }
	      },
	      '158': {
	        start: {
	          line: 334,
	          column: 8
	        },
	        end: {
	          line: 334,
	          column: 31
	        }
	      },
	      '159': {
	        start: {
	          line: 335,
	          column: 8
	        },
	        end: {
	          line: 335,
	          column: 15
	        }
	      },
	      '160': {
	        start: {
	          line: 340,
	          column: 24
	        },
	        end: {
	          line: 340,
	          column: 59
	        }
	      },
	      '161': {
	        start: {
	          line: 342,
	          column: 4
	        },
	        end: {
	          line: 358,
	          column: 5
	        }
	      },
	      '162': {
	        start: {
	          line: 343,
	          column: 19
	        },
	        end: {
	          line: 343,
	          column: 32
	        }
	      },
	      '163': {
	        start: {
	          line: 345,
	          column: 6
	        },
	        end: {
	          line: 357,
	          column: 7
	        }
	      },
	      '164': {
	        start: {
	          line: 346,
	          column: 8
	        },
	        end: {
	          line: 346,
	          column: 31
	        }
	      },
	      '165': {
	        start: {
	          line: 347,
	          column: 8
	        },
	        end: {
	          line: 349,
	          column: 9
	        }
	      },
	      '166': {
	        start: {
	          line: 348,
	          column: 10
	        },
	        end: {
	          line: 348,
	          column: 67
	        }
	      },
	      '167': {
	        start: {
	          line: 350,
	          column: 8
	        },
	        end: {
	          line: 350,
	          column: 24
	        }
	      },
	      '168': {
	        start: {
	          line: 351,
	          column: 13
	        },
	        end: {
	          line: 357,
	          column: 7
	        }
	      },
	      '169': {
	        start: {
	          line: 352,
	          column: 8
	        },
	        end: {
	          line: 352,
	          column: 34
	        }
	      },
	      '170': {
	        start: {
	          line: 353,
	          column: 8
	        },
	        end: {
	          line: 353,
	          column: 21
	        }
	      },
	      '171': {
	        start: {
	          line: 355,
	          column: 8
	        },
	        end: {
	          line: 355,
	          column: 34
	        }
	      },
	      '172': {
	        start: {
	          line: 356,
	          column: 8
	        },
	        end: {
	          line: 356,
	          column: 24
	        }
	      },
	      '173': {
	        start: {
	          line: 373,
	          column: 20
	        },
	        end: {
	          line: 380,
	          column: 1
	        }
	      },
	      '174': {
	        start: {
	          line: 374,
	          column: 2
	        },
	        end: {
	          line: 378,
	          column: 3
	        }
	      },
	      '175': {
	        start: {
	          line: 375,
	          column: 4
	        },
	        end: {
	          line: 377,
	          column: 5
	        }
	      },
	      '176': {
	        start: {
	          line: 376,
	          column: 6
	        },
	        end: {
	          line: 376,
	          column: 18
	        }
	      },
	      '177': {
	        start: {
	          line: 379,
	          column: 2
	        },
	        end: {
	          line: 379,
	          column: 15
	        }
	      },
	      '178': {
	        start: {
	          line: 391,
	          column: 17
	        },
	        end: {
	          line: 403,
	          column: 1
	        }
	      },
	      '179': {
	        start: {
	          line: 392,
	          column: 14
	        },
	        end: {
	          line: 392,
	          column: 56
	        }
	      },
	      '180': {
	        start: {
	          line: 395,
	          column: 2
	        },
	        end: {
	          line: 400,
	          column: 3
	        }
	      },
	      '181': {
	        start: {
	          line: 396,
	          column: 4
	        },
	        end: {
	          line: 399,
	          column: 5
	        }
	      },
	      '182': {
	        start: {
	          line: 397,
	          column: 6
	        },
	        end: {
	          line: 397,
	          column: 18
	        }
	      },
	      '183': {
	        start: {
	          line: 398,
	          column: 6
	        },
	        end: {
	          line: 398,
	          column: 12
	        }
	      },
	      '184': {
	        start: {
	          line: 402,
	          column: 2
	        },
	        end: {
	          line: 402,
	          column: 12
	        }
	      },
	      '185': {
	        start: {
	          line: 421,
	          column: 19
	        },
	        end: {
	          line: 468,
	          column: 1
	        }
	      },
	      '186': {
	        start: {
	          line: 422,
	          column: 17
	        },
	        end: {
	          line: 422,
	          column: 21
	        }
	      },
	      '187': {
	        start: {
	          line: 424,
	          column: 2
	        },
	        end: {
	          line: 426,
	          column: 3
	        }
	      },
	      '188': {
	        start: {
	          line: 425,
	          column: 4
	        },
	        end: {
	          line: 425,
	          column: 93
	        }
	      },
	      '189': {
	        start: {
	          line: 428,
	          column: 2
	        },
	        end: {
	          line: 431,
	          column: 3
	        }
	      },
	      '190': {
	        start: {
	          line: 429,
	          column: 4
	        },
	        end: {
	          line: 429,
	          column: 133
	        }
	      },
	      '191': {
	        start: {
	          line: 430,
	          column: 4
	        },
	        end: {
	          line: 430,
	          column: 28
	        }
	      },
	      '192': {
	        start: {
	          line: 433,
	          column: 2
	        },
	        end: {
	          line: 433,
	          column: 52
	        }
	      },
	      '193': {
	        start: {
	          line: 438,
	          column: 2
	        },
	        end: {
	          line: 461,
	          column: 3
	        }
	      },
	      '194': {
	        start: {
	          line: 439,
	          column: 15
	        },
	        end: {
	          line: 439,
	          column: 39
	        }
	      },
	      '195': {
	        start: {
	          line: 443,
	          column: 4
	        },
	        end: {
	          line: 460,
	          column: 5
	        }
	      },
	      '196': {
	        start: {
	          line: 444,
	          column: 25
	        },
	        end: {
	          line: 444,
	          column: 38
	        }
	      },
	      '197': {
	        start: {
	          line: 445,
	          column: 26
	        },
	        end: {
	          line: 445,
	          column: 40
	        }
	      },
	      '198': {
	        start: {
	          line: 449,
	          column: 6
	        },
	        end: {
	          line: 449,
	          column: 36
	        }
	      },
	      '199': {
	        start: {
	          line: 450,
	          column: 6
	        },
	        end: {
	          line: 450,
	          column: 22
	        }
	      },
	      '200': {
	        start: {
	          line: 453,
	          column: 6
	        },
	        end: {
	          line: 457,
	          column: 7
	        }
	      },
	      '201': {
	        start: {
	          line: 454,
	          column: 8
	        },
	        end: {
	          line: 454,
	          column: 49
	        }
	      },
	      '202': {
	        start: {
	          line: 456,
	          column: 8
	        },
	        end: {
	          line: 456,
	          column: 35
	        }
	      },
	      '203': {
	        start: {
	          line: 459,
	          column: 6
	        },
	        end: {
	          line: 459,
	          column: 22
	        }
	      },
	      '204': {
	        start: {
	          line: 463,
	          column: 2
	        },
	        end: {
	          line: 465,
	          column: 3
	        }
	      },
	      '205': {
	        start: {
	          line: 464,
	          column: 4
	        },
	        end: {
	          line: 464,
	          column: 45
	        }
	      },
	      '206': {
	        start: {
	          line: 467,
	          column: 2
	        },
	        end: {
	          line: 467,
	          column: 58
	        }
	      },
	      '207': {
	        start: {
	          line: 471,
	          column: 0
	        },
	        end: {
	          line: 471,
	          column: 56
	        }
	      },
	      '208': {
	        start: {
	          line: 472,
	          column: 0
	        },
	        end: {
	          line: 472,
	          column: 64
	        }
	      },
	      '209': {
	        start: {
	          line: 475,
	          column: 0
	        },
	        end: {
	          line: 475,
	          column: 41
	        }
	      },
	      '210': {
	        start: {
	          line: 477,
	          column: 0
	        },
	        end: {
	          line: 477,
	          column: 29
	        }
	      }
	    },
	    fnMap: {
	      '0': {
	        name: '(anonymous_0)',
	        decl: {
	          start: {
	            line: 9,
	            column: 16
	          },
	          end: {
	            line: 9,
	            column: 17
	          }
	        },
	        loc: {
	          start: {
	            line: 9,
	            column: 40
	          },
	          end: {
	            line: 16,
	            column: 1
	          }
	        },
	        line: 9
	      },
	      '1': {
	        name: '(anonymous_1)',
	        decl: {
	          start: {
	            line: 19,
	            column: 34
	          },
	          end: {
	            line: 19,
	            column: 35
	          }
	        },
	        loc: {
	          start: {
	            line: 19,
	            column: 40
	          },
	          end: {
	            line: 24,
	            column: 1
	          }
	        },
	        line: 19
	      },
	      '2': {
	        name: '(anonymous_2)',
	        decl: {
	          start: {
	            line: 35,
	            column: 25
	          },
	          end: {
	            line: 35,
	            column: 26
	          }
	        },
	        loc: {
	          start: {
	            line: 35,
	            column: 38
	          },
	          end: {
	            line: 37,
	            column: 1
	          }
	        },
	        line: 35
	      },
	      '3': {
	        name: '(anonymous_3)',
	        decl: {
	          start: {
	            line: 38,
	            column: 28
	          },
	          end: {
	            line: 38,
	            column: 29
	          }
	        },
	        loc: {
	          start: {
	            line: 38,
	            column: 41
	          },
	          end: {
	            line: 44,
	            column: 1
	          }
	        },
	        line: 38
	      },
	      '4': {
	        name: '(anonymous_4)',
	        decl: {
	          start: {
	            line: 46,
	            column: 15
	          },
	          end: {
	            line: 46,
	            column: 16
	          }
	        },
	        loc: {
	          start: {
	            line: 46,
	            column: 28
	          },
	          end: {
	            line: 48,
	            column: 1
	          }
	        },
	        line: 46
	      },
	      '5': {
	        name: '(anonymous_5)',
	        decl: {
	          start: {
	            line: 49,
	            column: 18
	          },
	          end: {
	            line: 49,
	            column: 19
	          }
	        },
	        loc: {
	          start: {
	            line: 49,
	            column: 31
	          },
	          end: {
	            line: 51,
	            column: 1
	          }
	        },
	        line: 49
	      },
	      '6': {
	        name: '(anonymous_6)',
	        decl: {
	          start: {
	            line: 53,
	            column: 24
	          },
	          end: {
	            line: 53,
	            column: 25
	          }
	        },
	        loc: {
	          start: {
	            line: 53,
	            column: 44
	          },
	          end: {
	            line: 99,
	            column: 1
	          }
	        },
	        line: 53
	      },
	      '7': {
	        name: '(anonymous_7)',
	        decl: {
	          start: {
	            line: 105,
	            column: 2
	          },
	          end: {
	            line: 105,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 105,
	            column: 46
	          },
	          end: {
	            line: 120,
	            column: 3
	          }
	        },
	        line: 105
	      },
	      '8': {
	        name: '(anonymous_8)',
	        decl: {
	          start: {
	            line: 122,
	            column: 2
	          },
	          end: {
	            line: 122,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 122,
	            column: 24
	          },
	          end: {
	            line: 128,
	            column: 3
	          }
	        },
	        line: 122
	      },
	      '9': {
	        name: '(anonymous_9)',
	        decl: {
	          start: {
	            line: 130,
	            column: 2
	          },
	          end: {
	            line: 130,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 130,
	            column: 29
	          },
	          end: {
	            line: 135,
	            column: 3
	          }
	        },
	        line: 130
	      },
	      '10': {
	        name: '(anonymous_10)',
	        decl: {
	          start: {
	            line: 137,
	            column: 2
	          },
	          end: {
	            line: 137,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 137,
	            column: 13
	          },
	          end: {
	            line: 203,
	            column: 3
	          }
	        },
	        line: 137
	      },
	      '11': {
	        name: '(anonymous_11)',
	        decl: {
	          start: {
	            line: 144,
	            column: 23
	          },
	          end: {
	            line: 144,
	            column: 24
	          }
	        },
	        loc: {
	          start: {
	            line: 144,
	            column: 30
	          },
	          end: {
	            line: 148,
	            column: 7
	          }
	        },
	        line: 144
	      },
	      '12': {
	        name: '(anonymous_12)',
	        decl: {
	          start: {
	            line: 208,
	            column: 2
	          },
	          end: {
	            line: 208,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 208,
	            column: 31
	          },
	          end: {
	            line: 257,
	            column: 3
	          }
	        },
	        line: 208
	      },
	      '13': {
	        name: '(anonymous_13)',
	        decl: {
	          start: {
	            line: 235,
	            column: 71
	          },
	          end: {
	            line: 235,
	            column: 72
	          }
	        },
	        loc: {
	          start: {
	            line: 235,
	            column: 82
	          },
	          end: {
	            line: 237,
	            column: 5
	          }
	        },
	        line: 235
	      },
	      '14': {
	        name: '(anonymous_14)',
	        decl: {
	          start: {
	            line: 241,
	            column: 31
	          },
	          end: {
	            line: 241,
	            column: 32
	          }
	        },
	        loc: {
	          start: {
	            line: 241,
	            column: 37
	          },
	          end: {
	            line: 243,
	            column: 5
	          }
	        },
	        line: 241
	      },
	      '15': {
	        name: '(anonymous_15)',
	        decl: {
	          start: {
	            line: 245,
	            column: 29
	          },
	          end: {
	            line: 245,
	            column: 30
	          }
	        },
	        loc: {
	          start: {
	            line: 245,
	            column: 35
	          },
	          end: {
	            line: 247,
	            column: 5
	          }
	        },
	        line: 245
	      },
	      '16': {
	        name: '(anonymous_16)',
	        decl: {
	          start: {
	            line: 249,
	            column: 23
	          },
	          end: {
	            line: 249,
	            column: 24
	          }
	        },
	        loc: {
	          start: {
	            line: 249,
	            column: 29
	          },
	          end: {
	            line: 252,
	            column: 5
	          }
	        },
	        line: 249
	      },
	      '17': {
	        name: '(anonymous_17)',
	        decl: {
	          start: {
	            line: 254,
	            column: 31
	          },
	          end: {
	            line: 254,
	            column: 32
	          }
	        },
	        loc: {
	          start: {
	            line: 254,
	            column: 37
	          },
	          end: {
	            line: 256,
	            column: 5
	          }
	        },
	        line: 254
	      },
	      '18': {
	        name: '(anonymous_18)',
	        decl: {
	          start: {
	            line: 259,
	            column: 2
	          },
	          end: {
	            line: 259,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 259,
	            column: 13
	          },
	          end: {
	            line: 261,
	            column: 3
	          }
	        },
	        line: 259
	      },
	      '19': {
	        name: '(anonymous_19)',
	        decl: {
	          start: {
	            line: 263,
	            column: 2
	          },
	          end: {
	            line: 263,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 263,
	            column: 11
	          },
	          end: {
	            line: 268,
	            column: 3
	          }
	        },
	        line: 263
	      },
	      '20': {
	        name: '(anonymous_20)',
	        decl: {
	          start: {
	            line: 265,
	            column: 25
	          },
	          end: {
	            line: 265,
	            column: 26
	          }
	        },
	        loc: {
	          start: {
	            line: 265,
	            column: 30
	          },
	          end: {
	            line: 265,
	            column: 41
	          }
	        },
	        line: 265
	      },
	      '21': {
	        name: '(anonymous_21)',
	        decl: {
	          start: {
	            line: 270,
	            column: 2
	          },
	          end: {
	            line: 270,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 270,
	            column: 20
	          },
	          end: {
	            line: 317,
	            column: 3
	          }
	        },
	        line: 270
	      },
	      '22': {
	        name: '(anonymous_22)',
	        decl: {
	          start: {
	            line: 319,
	            column: 2
	          },
	          end: {
	            line: 319,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 319,
	            column: 11
	          },
	          end: {
	            line: 359,
	            column: 3
	          }
	        },
	        line: 319
	      },
	      '23': {
	        name: '(anonymous_23)',
	        decl: {
	          start: {
	            line: 373,
	            column: 20
	          },
	          end: {
	            line: 373,
	            column: 21
	          }
	        },
	        loc: {
	          start: {
	            line: 373,
	            column: 28
	          },
	          end: {
	            line: 380,
	            column: 1
	          }
	        },
	        line: 373
	      },
	      '24': {
	        name: '(anonymous_24)',
	        decl: {
	          start: {
	            line: 391,
	            column: 17
	          },
	          end: {
	            line: 391,
	            column: 18
	          }
	        },
	        loc: {
	          start: {
	            line: 391,
	            column: 32
	          },
	          end: {
	            line: 403,
	            column: 1
	          }
	        },
	        line: 391
	      },
	      '25': {
	        name: '(anonymous_25)',
	        decl: {
	          start: {
	            line: 421,
	            column: 19
	          },
	          end: {
	            line: 421,
	            column: 20
	          }
	        },
	        loc: {
	          start: {
	            line: 421,
	            column: 37
	          },
	          end: {
	            line: 468,
	            column: 1
	          }
	        },
	        line: 421
	      }
	    },
	    branchMap: {
	      '0': {
	        loc: {
	          start: {
	            line: 5,
	            column: 12
	          },
	          end: {
	            line: 5,
	            column: 34
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 5,
	            column: 12
	          },
	          end: {
	            line: 5,
	            column: 23
	          }
	        }, {
	          start: {
	            line: 5,
	            column: 27
	          },
	          end: {
	            line: 5,
	            column: 34
	          }
	        }],
	        line: 5
	      },
	      '1': {
	        loc: {
	          start: {
	            line: 6,
	            column: 23
	          },
	          end: {
	            line: 6,
	            column: 63
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 6,
	            column: 23
	          },
	          end: {
	            line: 6,
	            column: 45
	          }
	        }, {
	          start: {
	            line: 6,
	            column: 49
	          },
	          end: {
	            line: 6,
	            column: 63
	          }
	        }],
	        line: 6
	      },
	      '2': {
	        loc: {
	          start: {
	            line: 11,
	            column: 4
	          },
	          end: {
	            line: 13,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 11,
	            column: 4
	          },
	          end: {
	            line: 13,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 11,
	            column: 4
	          },
	          end: {
	            line: 13,
	            column: 5
	          }
	        }],
	        line: 11
	      },
	      '3': {
	        loc: {
	          start: {
	            line: 41,
	            column: 2
	          },
	          end: {
	            line: 43,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 41,
	            column: 2
	          },
	          end: {
	            line: 43,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 41,
	            column: 2
	          },
	          end: {
	            line: 43,
	            column: 3
	          }
	        }],
	        line: 41
	      },
	      '4': {
	        loc: {
	          start: {
	            line: 54,
	            column: 2
	          },
	          end: {
	            line: 59,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 54,
	            column: 2
	          },
	          end: {
	            line: 59,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 54,
	            column: 2
	          },
	          end: {
	            line: 59,
	            column: 3
	          }
	        }],
	        line: 54
	      },
	      '5': {
	        loc: {
	          start: {
	            line: 65,
	            column: 2
	          },
	          end: {
	            line: 97,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 65,
	            column: 2
	          },
	          end: {
	            line: 97,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 65,
	            column: 2
	          },
	          end: {
	            line: 97,
	            column: 3
	          }
	        }],
	        line: 65
	      },
	      '6': {
	        loc: {
	          start: {
	            line: 106,
	            column: 4
	          },
	          end: {
	            line: 108,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 106,
	            column: 4
	          },
	          end: {
	            line: 108,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 106,
	            column: 4
	          },
	          end: {
	            line: 108,
	            column: 5
	          }
	        }],
	        line: 106
	      },
	      '7': {
	        loc: {
	          start: {
	            line: 125,
	            column: 4
	          },
	          end: {
	            line: 127,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 125,
	            column: 4
	          },
	          end: {
	            line: 127,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 125,
	            column: 4
	          },
	          end: {
	            line: 127,
	            column: 5
	          }
	        }],
	        line: 125
	      },
	      '8': {
	        loc: {
	          start: {
	            line: 125,
	            column: 8
	          },
	          end: {
	            line: 125,
	            column: 48
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 125,
	            column: 8
	          },
	          end: {
	            line: 125,
	            column: 26
	          }
	        }, {
	          start: {
	            line: 125,
	            column: 30
	          },
	          end: {
	            line: 125,
	            column: 48
	          }
	        }],
	        line: 125
	      },
	      '9': {
	        loc: {
	          start: {
	            line: 132,
	            column: 4
	          },
	          end: {
	            line: 134,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 132,
	            column: 4
	          },
	          end: {
	            line: 134,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 132,
	            column: 4
	          },
	          end: {
	            line: 134,
	            column: 5
	          }
	        }],
	        line: 132
	      },
	      '10': {
	        loc: {
	          start: {
	            line: 141,
	            column: 4
	          },
	          end: {
	            line: 149,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 141,
	            column: 4
	          },
	          end: {
	            line: 149,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 141,
	            column: 4
	          },
	          end: {
	            line: 149,
	            column: 5
	          }
	        }],
	        line: 141
	      },
	      '11': {
	        loc: {
	          start: {
	            line: 159,
	            column: 4
	          },
	          end: {
	            line: 167,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 159,
	            column: 4
	          },
	          end: {
	            line: 167,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 159,
	            column: 4
	          },
	          end: {
	            line: 167,
	            column: 5
	          }
	        }],
	        line: 159
	      },
	      '12': {
	        loc: {
	          start: {
	            line: 195,
	            column: 22
	          },
	          end: {
	            line: 195,
	            column: 66
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 195,
	            column: 22
	          },
	          end: {
	            line: 195,
	            column: 31
	          }
	        }, {
	          start: {
	            line: 195,
	            column: 35
	          },
	          end: {
	            line: 195,
	            column: 66
	          }
	        }],
	        line: 195
	      },
	      '13': {
	        loc: {
	          start: {
	            line: 209,
	            column: 4
	          },
	          end: {
	            line: 211,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 209,
	            column: 4
	          },
	          end: {
	            line: 211,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 209,
	            column: 4
	          },
	          end: {
	            line: 211,
	            column: 5
	          }
	        }],
	        line: 209
	      },
	      '14': {
	        loc: {
	          start: {
	            line: 216,
	            column: 4
	          },
	          end: {
	            line: 220,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 216,
	            column: 4
	          },
	          end: {
	            line: 220,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 216,
	            column: 4
	          },
	          end: {
	            line: 220,
	            column: 5
	          }
	        }],
	        line: 216
	      },
	      '15': {
	        loc: {
	          start: {
	            line: 225,
	            column: 4
	          },
	          end: {
	            line: 227,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 225,
	            column: 4
	          },
	          end: {
	            line: 227,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 225,
	            column: 4
	          },
	          end: {
	            line: 227,
	            column: 5
	          }
	        }],
	        line: 225
	      },
	      '16': {
	        loc: {
	          start: {
	            line: 231,
	            column: 4
	          },
	          end: {
	            line: 233,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 231,
	            column: 4
	          },
	          end: {
	            line: 233,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 231,
	            column: 4
	          },
	          end: {
	            line: 233,
	            column: 5
	          }
	        }],
	        line: 231
	      },
	      '17': {
	        loc: {
	          start: {
	            line: 264,
	            column: 4
	          },
	          end: {
	            line: 267,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 264,
	            column: 4
	          },
	          end: {
	            line: 267,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 264,
	            column: 4
	          },
	          end: {
	            line: 267,
	            column: 5
	          }
	        }],
	        line: 264
	      },
	      '18': {
	        loc: {
	          start: {
	            line: 264,
	            column: 8
	          },
	          end: {
	            line: 264,
	            column: 39
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 264,
	            column: 8
	          },
	          end: {
	            line: 264,
	            column: 18
	          }
	        }, {
	          start: {
	            line: 264,
	            column: 22
	          },
	          end: {
	            line: 264,
	            column: 39
	          }
	        }],
	        line: 264
	      },
	      '19': {
	        loc: {
	          start: {
	            line: 271,
	            column: 21
	          },
	          end: {
	            line: 271,
	            column: 50
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 271,
	            column: 21
	          },
	          end: {
	            line: 271,
	            column: 44
	          }
	        }, {
	          start: {
	            line: 271,
	            column: 48
	          },
	          end: {
	            line: 271,
	            column: 50
	          }
	        }],
	        line: 271
	      },
	      '20': {
	        loc: {
	          start: {
	            line: 275,
	            column: 4
	          },
	          end: {
	            line: 279,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 275,
	            column: 4
	          },
	          end: {
	            line: 279,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 275,
	            column: 4
	          },
	          end: {
	            line: 279,
	            column: 5
	          }
	        }],
	        line: 275
	      },
	      '21': {
	        loc: {
	          start: {
	            line: 296,
	            column: 4
	          },
	          end: {
	            line: 303,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 296,
	            column: 4
	          },
	          end: {
	            line: 303,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 296,
	            column: 4
	          },
	          end: {
	            line: 303,
	            column: 5
	          }
	        }],
	        line: 296
	      },
	      '22': {
	        loc: {
	          start: {
	            line: 308,
	            column: 4
	          },
	          end: {
	            line: 316,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 308,
	            column: 4
	          },
	          end: {
	            line: 316,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 308,
	            column: 4
	          },
	          end: {
	            line: 316,
	            column: 5
	          }
	        }],
	        line: 308
	      },
	      '23': {
	        loc: {
	          start: {
	            line: 308,
	            column: 8
	          },
	          end: {
	            line: 308,
	            column: 47
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 308,
	            column: 8
	          },
	          end: {
	            line: 308,
	            column: 25
	          }
	        }, {
	          start: {
	            line: 308,
	            column: 29
	          },
	          end: {
	            line: 308,
	            column: 47
	          }
	        }],
	        line: 308
	      },
	      '24': {
	        loc: {
	          start: {
	            line: 313,
	            column: 6
	          },
	          end: {
	            line: 315,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 313,
	            column: 6
	          },
	          end: {
	            line: 315,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 313,
	            column: 6
	          },
	          end: {
	            line: 315,
	            column: 7
	          }
	        }],
	        line: 313
	      },
	      '25': {
	        loc: {
	          start: {
	            line: 323,
	            column: 4
	          },
	          end: {
	            line: 328,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 323,
	            column: 4
	          },
	          end: {
	            line: 328,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 323,
	            column: 4
	          },
	          end: {
	            line: 328,
	            column: 5
	          }
	        }],
	        line: 323
	      },
	      '26': {
	        loc: {
	          start: {
	            line: 331,
	            column: 6
	          },
	          end: {
	            line: 336,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 331,
	            column: 6
	          },
	          end: {
	            line: 336,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 331,
	            column: 6
	          },
	          end: {
	            line: 336,
	            column: 7
	          }
	        }],
	        line: 331
	      },
	      '27': {
	        loc: {
	          start: {
	            line: 345,
	            column: 6
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 345,
	            column: 6
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 345,
	            column: 6
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        }],
	        line: 345
	      },
	      '28': {
	        loc: {
	          start: {
	            line: 347,
	            column: 8
	          },
	          end: {
	            line: 349,
	            column: 9
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 347,
	            column: 8
	          },
	          end: {
	            line: 349,
	            column: 9
	          }
	        }, {
	          start: {
	            line: 347,
	            column: 8
	          },
	          end: {
	            line: 349,
	            column: 9
	          }
	        }],
	        line: 347
	      },
	      '29': {
	        loc: {
	          start: {
	            line: 351,
	            column: 13
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 351,
	            column: 13
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 351,
	            column: 13
	          },
	          end: {
	            line: 357,
	            column: 7
	          }
	        }],
	        line: 351
	      },
	      '30': {
	        loc: {
	          start: {
	            line: 375,
	            column: 4
	          },
	          end: {
	            line: 377,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 375,
	            column: 4
	          },
	          end: {
	            line: 377,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 375,
	            column: 4
	          },
	          end: {
	            line: 377,
	            column: 5
	          }
	        }],
	        line: 375
	      },
	      '31': {
	        loc: {
	          start: {
	            line: 396,
	            column: 4
	          },
	          end: {
	            line: 399,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 396,
	            column: 4
	          },
	          end: {
	            line: 399,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 396,
	            column: 4
	          },
	          end: {
	            line: 399,
	            column: 5
	          }
	        }],
	        line: 396
	      },
	      '32': {
	        loc: {
	          start: {
	            line: 424,
	            column: 2
	          },
	          end: {
	            line: 426,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 424,
	            column: 2
	          },
	          end: {
	            line: 426,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 424,
	            column: 2
	          },
	          end: {
	            line: 426,
	            column: 3
	          }
	        }],
	        line: 424
	      },
	      '33': {
	        loc: {
	          start: {
	            line: 428,
	            column: 2
	          },
	          end: {
	            line: 431,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 428,
	            column: 2
	          },
	          end: {
	            line: 431,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 428,
	            column: 2
	          },
	          end: {
	            line: 431,
	            column: 3
	          }
	        }],
	        line: 428
	      },
	      '34': {
	        loc: {
	          start: {
	            line: 438,
	            column: 2
	          },
	          end: {
	            line: 461,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 438,
	            column: 2
	          },
	          end: {
	            line: 461,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 438,
	            column: 2
	          },
	          end: {
	            line: 461,
	            column: 3
	          }
	        }],
	        line: 438
	      },
	      '35': {
	        loc: {
	          start: {
	            line: 443,
	            column: 4
	          },
	          end: {
	            line: 460,
	            column: 5
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 443,
	            column: 4
	          },
	          end: {
	            line: 460,
	            column: 5
	          }
	        }, {
	          start: {
	            line: 443,
	            column: 4
	          },
	          end: {
	            line: 460,
	            column: 5
	          }
	        }],
	        line: 443
	      },
	      '36': {
	        loc: {
	          start: {
	            line: 453,
	            column: 6
	          },
	          end: {
	            line: 457,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 453,
	            column: 6
	          },
	          end: {
	            line: 457,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 453,
	            column: 6
	          },
	          end: {
	            line: 457,
	            column: 7
	          }
	        }],
	        line: 453
	      },
	      '37': {
	        loc: {
	          start: {
	            line: 463,
	            column: 2
	          },
	          end: {
	            line: 465,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 463,
	            column: 2
	          },
	          end: {
	            line: 465,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 463,
	            column: 2
	          },
	          end: {
	            line: 465,
	            column: 3
	          }
	        }],
	        line: 463
	      }
	    },
	    s: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0,
	      '10': 0,
	      '11': 0,
	      '12': 0,
	      '13': 0,
	      '14': 0,
	      '15': 0,
	      '16': 0,
	      '17': 0,
	      '18': 0,
	      '19': 0,
	      '20': 0,
	      '21': 0,
	      '22': 0,
	      '23': 0,
	      '24': 0,
	      '25': 0,
	      '26': 0,
	      '27': 0,
	      '28': 0,
	      '29': 0,
	      '30': 0,
	      '31': 0,
	      '32': 0,
	      '33': 0,
	      '34': 0,
	      '35': 0,
	      '36': 0,
	      '37': 0,
	      '38': 0,
	      '39': 0,
	      '40': 0,
	      '41': 0,
	      '42': 0,
	      '43': 0,
	      '44': 0,
	      '45': 0,
	      '46': 0,
	      '47': 0,
	      '48': 0,
	      '49': 0,
	      '50': 0,
	      '51': 0,
	      '52': 0,
	      '53': 0,
	      '54': 0,
	      '55': 0,
	      '56': 0,
	      '57': 0,
	      '58': 0,
	      '59': 0,
	      '60': 0,
	      '61': 0,
	      '62': 0,
	      '63': 0,
	      '64': 0,
	      '65': 0,
	      '66': 0,
	      '67': 0,
	      '68': 0,
	      '69': 0,
	      '70': 0,
	      '71': 0,
	      '72': 0,
	      '73': 0,
	      '74': 0,
	      '75': 0,
	      '76': 0,
	      '77': 0,
	      '78': 0,
	      '79': 0,
	      '80': 0,
	      '81': 0,
	      '82': 0,
	      '83': 0,
	      '84': 0,
	      '85': 0,
	      '86': 0,
	      '87': 0,
	      '88': 0,
	      '89': 0,
	      '90': 0,
	      '91': 0,
	      '92': 0,
	      '93': 0,
	      '94': 0,
	      '95': 0,
	      '96': 0,
	      '97': 0,
	      '98': 0,
	      '99': 0,
	      '100': 0,
	      '101': 0,
	      '102': 0,
	      '103': 0,
	      '104': 0,
	      '105': 0,
	      '106': 0,
	      '107': 0,
	      '108': 0,
	      '109': 0,
	      '110': 0,
	      '111': 0,
	      '112': 0,
	      '113': 0,
	      '114': 0,
	      '115': 0,
	      '116': 0,
	      '117': 0,
	      '118': 0,
	      '119': 0,
	      '120': 0,
	      '121': 0,
	      '122': 0,
	      '123': 0,
	      '124': 0,
	      '125': 0,
	      '126': 0,
	      '127': 0,
	      '128': 0,
	      '129': 0,
	      '130': 0,
	      '131': 0,
	      '132': 0,
	      '133': 0,
	      '134': 0,
	      '135': 0,
	      '136': 0,
	      '137': 0,
	      '138': 0,
	      '139': 0,
	      '140': 0,
	      '141': 0,
	      '142': 0,
	      '143': 0,
	      '144': 0,
	      '145': 0,
	      '146': 0,
	      '147': 0,
	      '148': 0,
	      '149': 0,
	      '150': 0,
	      '151': 0,
	      '152': 0,
	      '153': 0,
	      '154': 0,
	      '155': 0,
	      '156': 0,
	      '157': 0,
	      '158': 0,
	      '159': 0,
	      '160': 0,
	      '161': 0,
	      '162': 0,
	      '163': 0,
	      '164': 0,
	      '165': 0,
	      '166': 0,
	      '167': 0,
	      '168': 0,
	      '169': 0,
	      '170': 0,
	      '171': 0,
	      '172': 0,
	      '173': 0,
	      '174': 0,
	      '175': 0,
	      '176': 0,
	      '177': 0,
	      '178': 0,
	      '179': 0,
	      '180': 0,
	      '181': 0,
	      '182': 0,
	      '183': 0,
	      '184': 0,
	      '185': 0,
	      '186': 0,
	      '187': 0,
	      '188': 0,
	      '189': 0,
	      '190': 0,
	      '191': 0,
	      '192': 0,
	      '193': 0,
	      '194': 0,
	      '195': 0,
	      '196': 0,
	      '197': 0,
	      '198': 0,
	      '199': 0,
	      '200': 0,
	      '201': 0,
	      '202': 0,
	      '203': 0,
	      '204': 0,
	      '205': 0,
	      '206': 0,
	      '207': 0,
	      '208': 0,
	      '209': 0,
	      '210': 0
	    },
	    f: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0,
	      '10': 0,
	      '11': 0,
	      '12': 0,
	      '13': 0,
	      '14': 0,
	      '15': 0,
	      '16': 0,
	      '17': 0,
	      '18': 0,
	      '19': 0,
	      '20': 0,
	      '21': 0,
	      '22': 0,
	      '23': 0,
	      '24': 0,
	      '25': 0
	    },
	    b: {
	      '0': [0, 0],
	      '1': [0, 0],
	      '2': [0, 0],
	      '3': [0, 0],
	      '4': [0, 0],
	      '5': [0, 0],
	      '6': [0, 0],
	      '7': [0, 0],
	      '8': [0, 0],
	      '9': [0, 0],
	      '10': [0, 0],
	      '11': [0, 0],
	      '12': [0, 0],
	      '13': [0, 0],
	      '14': [0, 0],
	      '15': [0, 0],
	      '16': [0, 0],
	      '17': [0, 0],
	      '18': [0, 0],
	      '19': [0, 0],
	      '20': [0, 0],
	      '21': [0, 0],
	      '22': [0, 0],
	      '23': [0, 0],
	      '24': [0, 0],
	      '25': [0, 0],
	      '26': [0, 0],
	      '27': [0, 0],
	      '28': [0, 0],
	      '29': [0, 0],
	      '30': [0, 0],
	      '31': [0, 0],
	      '32': [0, 0],
	      '33': [0, 0],
	      '34': [0, 0],
	      '35': [0, 0],
	      '36': [0, 0],
	      '37': [0, 0]
	    },
	    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
	  },
	      coverage = global[gcv] || (global[gcv] = {});

	  if (coverage[path] && coverage[path].hash === hash) {
	    return coverage[path];
	  }

	  coverageData.hash = hash;
	  return coverage[path] = coverageData;
	}();
	var dom = (cov_1wu0dhrxa3.s[0]++, (cov_1wu0dhrxa3.b[0][0]++, videojs.dom) || (cov_1wu0dhrxa3.b[0][1]++, videojs));
	var registerPlugin$1 = (cov_1wu0dhrxa3.s[1]++, (cov_1wu0dhrxa3.b[1][0]++, videojs.registerPlugin) || (cov_1wu0dhrxa3.b[1][1]++, videojs.plugin));
	cov_1wu0dhrxa3.s[2]++;

	var indexOf = function indexOf(array, target) {
	  cov_1wu0dhrxa3.f[0]++;
	  cov_1wu0dhrxa3.s[3]++;

	  for (var i = 0, length = array.length; i < length; i++) {
	    cov_1wu0dhrxa3.s[4]++;

	    if (array[i] === target) {
	      cov_1wu0dhrxa3.b[2][0]++;
	      cov_1wu0dhrxa3.s[5]++;
	      return i;
	    } else {
	      cov_1wu0dhrxa3.b[2][1]++;
	    }
	  }

	  cov_1wu0dhrxa3.s[6]++;
	  return -1;
	};

	var supportsCssPointerEvents = (cov_1wu0dhrxa3.s[7]++, function () {
	  cov_1wu0dhrxa3.f[1]++;
	  var element = (cov_1wu0dhrxa3.s[8]++, document_1.createElement('x'));
	  cov_1wu0dhrxa3.s[9]++;
	  element.style.cssText = 'pointer-events:auto';
	  cov_1wu0dhrxa3.s[10]++;
	  return element.style.pointerEvents === 'auto';
	}());
	var defaults = (cov_1wu0dhrxa3.s[11]++, {
	  className: 'vjs-playlist',
	  playOnSelect: false,
	  supportsCssPointerEvents: supportsCssPointerEvents
	});
	cov_1wu0dhrxa3.s[12]++;

	var addSelectedClass = function addSelectedClass(el) {
	  cov_1wu0dhrxa3.f[2]++;
	  cov_1wu0dhrxa3.s[13]++;
	  el.addClass('vjs-selected');
	};

	cov_1wu0dhrxa3.s[14]++;

	var removeSelectedClass = function removeSelectedClass(el) {
	  cov_1wu0dhrxa3.f[3]++;
	  cov_1wu0dhrxa3.s[15]++;
	  el.removeClass('vjs-selected');
	  cov_1wu0dhrxa3.s[16]++;

	  if (el.thumbnail) {
	    cov_1wu0dhrxa3.b[3][0]++;
	    cov_1wu0dhrxa3.s[17]++;
	    dom.removeClass(el.thumbnail, 'vjs-playlist-now-playing');
	  } else {
	    cov_1wu0dhrxa3.b[3][1]++;
	  }
	};

	cov_1wu0dhrxa3.s[18]++;

	var upNext = function upNext(el) {
	  cov_1wu0dhrxa3.f[4]++;
	  cov_1wu0dhrxa3.s[19]++;
	  el.addClass('vjs-up-next');
	};

	cov_1wu0dhrxa3.s[20]++;

	var notUpNext = function notUpNext(el) {
	  cov_1wu0dhrxa3.f[5]++;
	  cov_1wu0dhrxa3.s[21]++;
	  el.removeClass('vjs-up-next');
	};

	cov_1wu0dhrxa3.s[22]++;

	var createThumbnail = function createThumbnail(thumbnail) {
	  cov_1wu0dhrxa3.f[6]++;
	  cov_1wu0dhrxa3.s[23]++;

	  if (!thumbnail) {
	    cov_1wu0dhrxa3.b[4][0]++;
	    var placeholder = (cov_1wu0dhrxa3.s[24]++, document_1.createElement('div'));
	    cov_1wu0dhrxa3.s[25]++;
	    placeholder.className = 'vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder';
	    cov_1wu0dhrxa3.s[26]++;
	    return placeholder;
	  } else {
	    cov_1wu0dhrxa3.b[4][1]++;
	  }

	  var picture = (cov_1wu0dhrxa3.s[27]++, document_1.createElement('picture'));
	  cov_1wu0dhrxa3.s[28]++;
	  picture.className = 'vjs-playlist-thumbnail';
	  cov_1wu0dhrxa3.s[29]++;

	  if (typeof thumbnail === 'string') {
	    cov_1wu0dhrxa3.b[5][0]++;
	    var img = (cov_1wu0dhrxa3.s[30]++, document_1.createElement('img'));
	    cov_1wu0dhrxa3.s[31]++;
	    img.src = thumbnail;
	    cov_1wu0dhrxa3.s[32]++;
	    img.alt = '';
	    cov_1wu0dhrxa3.s[33]++;
	    picture.appendChild(img);
	  } else {
	    cov_1wu0dhrxa3.b[5][1]++;
	    cov_1wu0dhrxa3.s[34]++;

	    for (var i = 0; i < thumbnail.length - 1; i++) {
	      var _variant = (cov_1wu0dhrxa3.s[35]++, thumbnail[i]);

	      var source = (cov_1wu0dhrxa3.s[36]++, document_1.createElement('source'));
	      cov_1wu0dhrxa3.s[37]++;

	      for (var prop in _variant) {
	        cov_1wu0dhrxa3.s[38]++;
	        source[prop] = _variant[prop];
	      }

	      cov_1wu0dhrxa3.s[39]++;
	      picture.appendChild(source);
	    }

	    var variant = (cov_1wu0dhrxa3.s[40]++, thumbnail[thumbnail.length - 1]);

	    var _img = (cov_1wu0dhrxa3.s[41]++, document_1.createElement('img'));

	    cov_1wu0dhrxa3.s[42]++;
	    _img.alt = '';
	    cov_1wu0dhrxa3.s[43]++;

	    for (var _prop in variant) {
	      cov_1wu0dhrxa3.s[44]++;
	      _img[_prop] = variant[_prop];
	    }

	    cov_1wu0dhrxa3.s[45]++;
	    picture.appendChild(_img);
	  }

	  cov_1wu0dhrxa3.s[46]++;
	  return picture;
	};

	var Component = (cov_1wu0dhrxa3.s[47]++, videojs.getComponent('Component'));

	var PlaylistMenuItem =
	/*#__PURE__*/
	function (_Component) {
	  _inheritsLoose(PlaylistMenuItem, _Component);

	  function PlaylistMenuItem(player, playlistItem, settings) {
	    var _this;

	    cov_1wu0dhrxa3.f[7]++;
	    cov_1wu0dhrxa3.s[48]++;

	    if (!playlistItem.item) {
	      cov_1wu0dhrxa3.b[6][0]++;
	      cov_1wu0dhrxa3.s[49]++;
	      throw new Error('Cannot construct a PlaylistMenuItem without an item option');
	    } else {
	      cov_1wu0dhrxa3.b[6][1]++;
	    }

	    cov_1wu0dhrxa3.s[50]++;
	    _this = _Component.call(this, player, playlistItem) || this;
	    cov_1wu0dhrxa3.s[51]++;
	    _this.item = playlistItem.item;
	    cov_1wu0dhrxa3.s[52]++;
	    _this.playOnSelect = settings.playOnSelect;
	    cov_1wu0dhrxa3.s[53]++;

	    _this.emitTapEvents();

	    cov_1wu0dhrxa3.s[54]++;

	    _this.on(['click', 'tap'], _this.switchPlaylistItem_);

	    cov_1wu0dhrxa3.s[55]++;

	    _this.on('keydown', _this.handleKeyDown_);

	    return _this;
	  }

	  var _proto = PlaylistMenuItem.prototype;

	  _proto.handleKeyDown_ = function handleKeyDown_(event) {
	    cov_1wu0dhrxa3.f[8]++;
	    cov_1wu0dhrxa3.s[56]++;

	    if ((cov_1wu0dhrxa3.b[8][0]++, event.which === 13) || (cov_1wu0dhrxa3.b[8][1]++, event.which === 32)) {
	      cov_1wu0dhrxa3.b[7][0]++;
	      cov_1wu0dhrxa3.s[57]++;
	      this.switchPlaylistItem_();
	    } else {
	      cov_1wu0dhrxa3.b[7][1]++;
	    }
	  };

	  _proto.switchPlaylistItem_ = function switchPlaylistItem_(event) {
	    cov_1wu0dhrxa3.f[9]++;
	    cov_1wu0dhrxa3.s[58]++;
	    this.player_.playlist.currentItem(indexOf(this.player_.playlist(), this.item));
	    cov_1wu0dhrxa3.s[59]++;

	    if (this.playOnSelect) {
	      cov_1wu0dhrxa3.b[9][0]++;
	      cov_1wu0dhrxa3.s[60]++;
	      this.player_.play();
	    } else {
	      cov_1wu0dhrxa3.b[9][1]++;
	    }
	  };

	  _proto.createEl = function createEl() {
	    cov_1wu0dhrxa3.f[10]++;
	    var li = (cov_1wu0dhrxa3.s[61]++, document_1.createElement('li'));
	    var item = (cov_1wu0dhrxa3.s[62]++, this.options_.item);
	    cov_1wu0dhrxa3.s[63]++;

	    if (typeof item.data === 'object') {
	      cov_1wu0dhrxa3.b[10][0]++;
	      var dataKeys = (cov_1wu0dhrxa3.s[64]++, Object.keys(item.data));
	      cov_1wu0dhrxa3.s[65]++;
	      dataKeys.forEach(function (key) {
	        cov_1wu0dhrxa3.f[11]++;
	        var value = (cov_1wu0dhrxa3.s[66]++, item.data[key]);
	        cov_1wu0dhrxa3.s[67]++;
	        li.dataset[key] = value;
	      });
	    } else {
	      cov_1wu0dhrxa3.b[10][1]++;
	    }

	    cov_1wu0dhrxa3.s[68]++;
	    li.className = 'vjs-playlist-item';
	    cov_1wu0dhrxa3.s[69]++;
	    li.setAttribute('tabIndex', 0);
	    cov_1wu0dhrxa3.s[70]++;
	    this.thumbnail = createThumbnail(item.thumbnail);
	    cov_1wu0dhrxa3.s[71]++;
	    li.appendChild(this.thumbnail);
	    cov_1wu0dhrxa3.s[72]++;

	    if (item.duration) {
	      cov_1wu0dhrxa3.b[11][0]++;
	      var duration = (cov_1wu0dhrxa3.s[73]++, document_1.createElement('time'));
	      var time = (cov_1wu0dhrxa3.s[74]++, videojs.formatTime(item.duration));
	      cov_1wu0dhrxa3.s[75]++;
	      duration.className = 'vjs-playlist-duration';
	      cov_1wu0dhrxa3.s[76]++;
	      duration.setAttribute('datetime', 'PT0H0M' + item.duration + 'S');
	      cov_1wu0dhrxa3.s[77]++;
	      duration.appendChild(document_1.createTextNode(time));
	      cov_1wu0dhrxa3.s[78]++;
	      li.appendChild(duration);
	    } else {
	      cov_1wu0dhrxa3.b[11][1]++;
	    }

	    var nowPlayingEl = (cov_1wu0dhrxa3.s[79]++, document_1.createElement('span'));
	    var nowPlayingText = (cov_1wu0dhrxa3.s[80]++, this.localize('Now Playing'));
	    cov_1wu0dhrxa3.s[81]++;
	    nowPlayingEl.className = 'vjs-playlist-now-playing-text';
	    cov_1wu0dhrxa3.s[82]++;
	    nowPlayingEl.appendChild(document_1.createTextNode(nowPlayingText));
	    cov_1wu0dhrxa3.s[83]++;
	    nowPlayingEl.setAttribute('title', nowPlayingText);
	    cov_1wu0dhrxa3.s[84]++;
	    this.thumbnail.appendChild(nowPlayingEl);
	    var titleContainerEl = (cov_1wu0dhrxa3.s[85]++, document_1.createElement('div'));
	    cov_1wu0dhrxa3.s[86]++;
	    titleContainerEl.className = 'vjs-playlist-title-container';
	    cov_1wu0dhrxa3.s[87]++;
	    this.thumbnail.appendChild(titleContainerEl);
	    var upNextEl = (cov_1wu0dhrxa3.s[88]++, document_1.createElement('span'));
	    var upNextText = (cov_1wu0dhrxa3.s[89]++, this.localize('Up Next'));
	    cov_1wu0dhrxa3.s[90]++;
	    upNextEl.className = 'vjs-up-next-text';
	    cov_1wu0dhrxa3.s[91]++;
	    upNextEl.appendChild(document_1.createTextNode(upNextText));
	    cov_1wu0dhrxa3.s[92]++;
	    upNextEl.setAttribute('title', upNextText);
	    cov_1wu0dhrxa3.s[93]++;
	    titleContainerEl.appendChild(upNextEl);
	    var titleEl = (cov_1wu0dhrxa3.s[94]++, document_1.createElement('cite'));
	    var titleText = (cov_1wu0dhrxa3.s[95]++, (cov_1wu0dhrxa3.b[12][0]++, item.name) || (cov_1wu0dhrxa3.b[12][1]++, this.localize('Untitled Video')));
	    cov_1wu0dhrxa3.s[96]++;
	    titleEl.className = 'vjs-playlist-name';
	    cov_1wu0dhrxa3.s[97]++;
	    titleEl.appendChild(document_1.createTextNode(titleText));
	    cov_1wu0dhrxa3.s[98]++;
	    titleEl.setAttribute('title', titleText);
	    cov_1wu0dhrxa3.s[99]++;
	    titleContainerEl.appendChild(titleEl);
	    cov_1wu0dhrxa3.s[100]++;
	    return li;
	  };

	  return PlaylistMenuItem;
	}(Component);

	var PlaylistMenu =
	/*#__PURE__*/
	function (_Component2) {
	  _inheritsLoose(PlaylistMenu, _Component2);

	  function PlaylistMenu(player, options) {
	    var _this2;

	    cov_1wu0dhrxa3.f[12]++;
	    cov_1wu0dhrxa3.s[101]++;

	    if (!player.playlist) {
	      cov_1wu0dhrxa3.b[13][0]++;
	      cov_1wu0dhrxa3.s[102]++;
	      throw new Error('videojs-playlist is required for the playlist component');
	    } else {
	      cov_1wu0dhrxa3.b[13][1]++;
	    }

	    cov_1wu0dhrxa3.s[103]++;
	    _this2 = _Component2.call(this, player, options) || this;
	    cov_1wu0dhrxa3.s[104]++;
	    _this2.items = [];
	    cov_1wu0dhrxa3.s[105]++;

	    if (options.horizontal) {
	      cov_1wu0dhrxa3.b[14][0]++;
	      cov_1wu0dhrxa3.s[106]++;

	      _this2.addClass('vjs-playlist-horizontal');
	    } else {
	      cov_1wu0dhrxa3.b[14][1]++;
	      cov_1wu0dhrxa3.s[107]++;

	      _this2.addClass('vjs-playlist-vertical');
	    }

	    cov_1wu0dhrxa3.s[108]++;

	    if (options.supportsCssPointerEvents) {
	      cov_1wu0dhrxa3.b[15][0]++;
	      cov_1wu0dhrxa3.s[109]++;

	      _this2.addClass('vjs-csspointerevents');
	    } else {
	      cov_1wu0dhrxa3.b[15][1]++;
	    }

	    cov_1wu0dhrxa3.s[110]++;

	    _this2.createPlaylist_();

	    cov_1wu0dhrxa3.s[111]++;

	    if (!videojs.browser.TOUCH_ENABLED) {
	      cov_1wu0dhrxa3.b[16][0]++;
	      cov_1wu0dhrxa3.s[112]++;

	      _this2.addClass('vjs-mouse');
	    } else {
	      cov_1wu0dhrxa3.b[16][1]++;
	    }

	    cov_1wu0dhrxa3.s[113]++;

	    _this2.on(player, ['loadstart', 'playlistchange', 'playlistsorted'], function (event) {
	      cov_1wu0dhrxa3.f[13]++;
	      cov_1wu0dhrxa3.s[114]++;

	      _this2.update();
	    });

	    cov_1wu0dhrxa3.s[115]++;

	    _this2.on(player, 'adstart', function () {
	      cov_1wu0dhrxa3.f[14]++;
	      cov_1wu0dhrxa3.s[116]++;

	      _this2.addClass('vjs-ad-playing');
	    });

	    cov_1wu0dhrxa3.s[117]++;

	    _this2.on(player, 'adend', function () {
	      cov_1wu0dhrxa3.f[15]++;
	      cov_1wu0dhrxa3.s[118]++;

	      _this2.removeClass('vjs-ad-playing');
	    });

	    cov_1wu0dhrxa3.s[119]++;

	    _this2.on('dispose', function () {
	      cov_1wu0dhrxa3.f[16]++;
	      cov_1wu0dhrxa3.s[120]++;

	      _this2.empty_();

	      cov_1wu0dhrxa3.s[121]++;
	      player.playlistMenu = null;
	    });

	    cov_1wu0dhrxa3.s[122]++;

	    _this2.on(player, 'dispose', function () {
	      cov_1wu0dhrxa3.f[17]++;
	      cov_1wu0dhrxa3.s[123]++;

	      _this2.dispose();
	    });

	    return _this2;
	  }

	  var _proto2 = PlaylistMenu.prototype;

	  _proto2.createEl = function createEl() {
	    cov_1wu0dhrxa3.f[18]++;
	    cov_1wu0dhrxa3.s[124]++;
	    return dom.createEl('div', {
	      className: this.options_.className
	    });
	  };

	  _proto2.empty_ = function empty_() {
	    cov_1wu0dhrxa3.f[19]++;
	    cov_1wu0dhrxa3.s[125]++;

	    if ((cov_1wu0dhrxa3.b[18][0]++, this.items) && (cov_1wu0dhrxa3.b[18][1]++, this.items.length)) {
	      cov_1wu0dhrxa3.b[17][0]++;
	      cov_1wu0dhrxa3.s[126]++;
	      this.items.forEach(function (i) {
	        cov_1wu0dhrxa3.f[20]++;
	        cov_1wu0dhrxa3.s[127]++;
	        return i.dispose();
	      });
	      cov_1wu0dhrxa3.s[128]++;
	      this.items.length = 0;
	    } else {
	      cov_1wu0dhrxa3.b[17][1]++;
	    }
	  };

	  _proto2.createPlaylist_ = function createPlaylist_() {
	    cov_1wu0dhrxa3.f[21]++;
	    var playlist = (cov_1wu0dhrxa3.s[129]++, (cov_1wu0dhrxa3.b[19][0]++, this.player_.playlist()) || (cov_1wu0dhrxa3.b[19][1]++, []));
	    var list = (cov_1wu0dhrxa3.s[130]++, this.el_.querySelector('.vjs-playlist-item-list'));
	    var overlay = (cov_1wu0dhrxa3.s[131]++, this.el_.querySelector('.vjs-playlist-ad-overlay'));
	    cov_1wu0dhrxa3.s[132]++;

	    if (!list) {
	      cov_1wu0dhrxa3.b[20][0]++;
	      cov_1wu0dhrxa3.s[133]++;
	      list = document_1.createElement('ol');
	      cov_1wu0dhrxa3.s[134]++;
	      list.className = 'vjs-playlist-item-list';
	      cov_1wu0dhrxa3.s[135]++;
	      this.el_.appendChild(list);
	    } else {
	      cov_1wu0dhrxa3.b[20][1]++;
	    }

	    cov_1wu0dhrxa3.s[136]++;
	    this.empty_();
	    cov_1wu0dhrxa3.s[137]++;

	    for (var i = 0; i < playlist.length; i++) {
	      var item = (cov_1wu0dhrxa3.s[138]++, new PlaylistMenuItem(this.player_, {
	        item: playlist[i]
	      }, this.options_));
	      cov_1wu0dhrxa3.s[139]++;
	      this.items.push(item);
	      cov_1wu0dhrxa3.s[140]++;
	      list.appendChild(item.el_);
	    }

	    cov_1wu0dhrxa3.s[141]++;

	    if (!overlay) {
	      cov_1wu0dhrxa3.b[21][0]++;
	      cov_1wu0dhrxa3.s[142]++;
	      overlay = document_1.createElement('li');
	      cov_1wu0dhrxa3.s[143]++;
	      overlay.className = 'vjs-playlist-ad-overlay';
	      cov_1wu0dhrxa3.s[144]++;
	      list.appendChild(overlay);
	    } else {
	      cov_1wu0dhrxa3.b[21][1]++;
	      cov_1wu0dhrxa3.s[145]++;
	      list.appendChild(overlay);
	    }

	    var selectedIndex = (cov_1wu0dhrxa3.s[146]++, this.player_.playlist.currentItem());
	    cov_1wu0dhrxa3.s[147]++;

	    if ((cov_1wu0dhrxa3.b[23][0]++, this.items.length) && (cov_1wu0dhrxa3.b[23][1]++, selectedIndex >= 0)) {
	      cov_1wu0dhrxa3.b[22][0]++;
	      cov_1wu0dhrxa3.s[148]++;
	      addSelectedClass(this.items[selectedIndex]);
	      var thumbnail = (cov_1wu0dhrxa3.s[149]++, this.items[selectedIndex].$('.vjs-playlist-thumbnail'));
	      cov_1wu0dhrxa3.s[150]++;

	      if (thumbnail) {
	        cov_1wu0dhrxa3.b[24][0]++;
	        cov_1wu0dhrxa3.s[151]++;
	        dom.addClass(thumbnail, 'vjs-playlist-now-playing');
	      } else {
	        cov_1wu0dhrxa3.b[24][1]++;
	      }
	    } else {
	      cov_1wu0dhrxa3.b[22][1]++;
	    }
	  };

	  _proto2.update = function update() {
	    cov_1wu0dhrxa3.f[22]++;
	    var playlist = (cov_1wu0dhrxa3.s[152]++, this.player_.playlist());
	    cov_1wu0dhrxa3.s[153]++;

	    if (this.items.length !== playlist.length) {
	      cov_1wu0dhrxa3.b[25][0]++;
	      cov_1wu0dhrxa3.s[154]++;
	      this.createPlaylist_();
	      cov_1wu0dhrxa3.s[155]++;
	      return;
	    } else {
	      cov_1wu0dhrxa3.b[25][1]++;
	    }

	    cov_1wu0dhrxa3.s[156]++;

	    for (var i = 0; i < this.items.length; i++) {
	      cov_1wu0dhrxa3.s[157]++;

	      if (this.items[i].item !== playlist[i]) {
	        cov_1wu0dhrxa3.b[26][0]++;
	        cov_1wu0dhrxa3.s[158]++;
	        this.createPlaylist_();
	        cov_1wu0dhrxa3.s[159]++;
	        return;
	      } else {
	        cov_1wu0dhrxa3.b[26][1]++;
	      }
	    }

	    var currentItem = (cov_1wu0dhrxa3.s[160]++, this.player_.playlist.currentItem());
	    cov_1wu0dhrxa3.s[161]++;

	    for (var _i = 0; _i < this.items.length; _i++) {
	      var item = (cov_1wu0dhrxa3.s[162]++, this.items[_i]);
	      cov_1wu0dhrxa3.s[163]++;

	      if (_i === currentItem) {
	        cov_1wu0dhrxa3.b[27][0]++;
	        cov_1wu0dhrxa3.s[164]++;
	        addSelectedClass(item);
	        cov_1wu0dhrxa3.s[165]++;

	        if (document_1.activeElement !== item.el()) {
	          cov_1wu0dhrxa3.b[28][0]++;
	          cov_1wu0dhrxa3.s[166]++;
	          dom.addClass(item.thumbnail, 'vjs-playlist-now-playing');
	        } else {
	          cov_1wu0dhrxa3.b[28][1]++;
	        }

	        cov_1wu0dhrxa3.s[167]++;
	        notUpNext(item);
	      } else {
	        cov_1wu0dhrxa3.b[27][1]++;
	        cov_1wu0dhrxa3.s[168]++;

	        if (_i === currentItem + 1) {
	          cov_1wu0dhrxa3.b[29][0]++;
	          cov_1wu0dhrxa3.s[169]++;
	          removeSelectedClass(item);
	          cov_1wu0dhrxa3.s[170]++;
	          upNext(item);
	        } else {
	          cov_1wu0dhrxa3.b[29][1]++;
	          cov_1wu0dhrxa3.s[171]++;
	          removeSelectedClass(item);
	          cov_1wu0dhrxa3.s[172]++;
	          notUpNext(item);
	        }
	      }
	    }
	  };

	  return PlaylistMenu;
	}(Component);

	cov_1wu0dhrxa3.s[173]++;

	var hasChildEls = function hasChildEls(el) {
	  cov_1wu0dhrxa3.f[23]++;
	  cov_1wu0dhrxa3.s[174]++;

	  for (var i = 0; i < el.childNodes.length; i++) {
	    cov_1wu0dhrxa3.s[175]++;

	    if (dom.isEl(el.childNodes[i])) {
	      cov_1wu0dhrxa3.b[30][0]++;
	      cov_1wu0dhrxa3.s[176]++;
	      return true;
	    } else {
	      cov_1wu0dhrxa3.b[30][1]++;
	    }
	  }

	  cov_1wu0dhrxa3.s[177]++;
	  return false;
	};

	cov_1wu0dhrxa3.s[178]++;

	var findRoot = function findRoot(className) {
	  cov_1wu0dhrxa3.f[24]++;
	  var all = (cov_1wu0dhrxa3.s[179]++, document_1.querySelectorAll('.' + className));
	  var el;
	  cov_1wu0dhrxa3.s[180]++;

	  for (var i = 0; i < all.length; i++) {
	    cov_1wu0dhrxa3.s[181]++;

	    if (!hasChildEls(all[i])) {
	      cov_1wu0dhrxa3.b[31][0]++;
	      cov_1wu0dhrxa3.s[182]++;
	      el = all[i];
	      cov_1wu0dhrxa3.s[183]++;
	      break;
	    } else {
	      cov_1wu0dhrxa3.b[31][1]++;
	    }
	  }

	  cov_1wu0dhrxa3.s[184]++;
	  return el;
	};

	cov_1wu0dhrxa3.s[185]++;

	var playlistUi = function playlistUi(options) {
	  cov_1wu0dhrxa3.f[25]++;
	  var player = (cov_1wu0dhrxa3.s[186]++, this);
	  cov_1wu0dhrxa3.s[187]++;

	  if (!player.playlist) {
	    cov_1wu0dhrxa3.b[32][0]++;
	    cov_1wu0dhrxa3.s[188]++;
	    throw new Error('videojs-playlist plugin is required by the videojs-playlist-ui plugin');
	  } else {
	    cov_1wu0dhrxa3.b[32][1]++;
	  }

	  cov_1wu0dhrxa3.s[189]++;

	  if (dom.isEl(options)) {
	    cov_1wu0dhrxa3.b[33][0]++;
	    cov_1wu0dhrxa3.s[190]++;
	    videojs.log.warn('videojs-playlist-ui: Passing an element directly to playlistUi() is deprecated, use the "el" option instead!');
	    cov_1wu0dhrxa3.s[191]++;
	    options = {
	      el: options
	    };
	  } else {
	    cov_1wu0dhrxa3.b[33][1]++;
	  }

	  cov_1wu0dhrxa3.s[192]++;
	  options = videojs.mergeOptions(defaults, options);
	  cov_1wu0dhrxa3.s[193]++;

	  if (player.playlistMenu) {
	    cov_1wu0dhrxa3.b[34][0]++;
	    var el = (cov_1wu0dhrxa3.s[194]++, player.playlistMenu.el());
	    cov_1wu0dhrxa3.s[195]++;

	    if (el) {
	      cov_1wu0dhrxa3.b[35][0]++;
	      var parentNode = (cov_1wu0dhrxa3.s[196]++, el.parentNode);
	      var nextSibling = (cov_1wu0dhrxa3.s[197]++, el.nextSibling);
	      cov_1wu0dhrxa3.s[198]++;
	      player.playlistMenu.dispose();
	      cov_1wu0dhrxa3.s[199]++;
	      dom.emptyEl(el);
	      cov_1wu0dhrxa3.s[200]++;

	      if (nextSibling) {
	        cov_1wu0dhrxa3.b[36][0]++;
	        cov_1wu0dhrxa3.s[201]++;
	        parentNode.insertBefore(el, nextSibling);
	      } else {
	        cov_1wu0dhrxa3.b[36][1]++;
	        cov_1wu0dhrxa3.s[202]++;
	        parentNode.appendChild(el);
	      }

	      cov_1wu0dhrxa3.s[203]++;
	      options.el = el;
	    } else {
	      cov_1wu0dhrxa3.b[35][1]++;
	    }
	  } else {
	    cov_1wu0dhrxa3.b[34][1]++;
	  }

	  cov_1wu0dhrxa3.s[204]++;

	  if (!dom.isEl(options.el)) {
	    cov_1wu0dhrxa3.b[37][0]++;
	    cov_1wu0dhrxa3.s[205]++;
	    options.el = findRoot(options.className);
	  } else {
	    cov_1wu0dhrxa3.b[37][1]++;
	  }

	  cov_1wu0dhrxa3.s[206]++;
	  player.playlistMenu = new PlaylistMenu(player, options);
	};

	cov_1wu0dhrxa3.s[207]++;
	videojs.registerComponent('PlaylistMenu', PlaylistMenu);
	cov_1wu0dhrxa3.s[208]++;
	videojs.registerComponent('PlaylistMenuItem', PlaylistMenuItem);
	cov_1wu0dhrxa3.s[209]++;
	registerPlugin$1('playlistUi', playlistUi);
	cov_1wu0dhrxa3.s[210]++;
	playlistUi.VERSION = version$1;

	/* eslint-disable no-console */
	var playlist = [{
	  name: 'Movie 1',
	  description: 'Movie 1 description',
	  duration: 100,
	  data: {
	    id: '1',
	    foo: 'bar'
	  },
	  sources: [{
	    src: '//example.com/movie1.mp4',
	    type: 'video/mp4'
	  }]
	}, {
	  sources: [{
	    src: '//example.com/movie2.mp4',
	    type: 'video/mp4'
	  }],
	  thumbnail: '//example.com/movie2.jpg'
	}];

	var resolveUrl = function resolveUrl(url) {
	  var a = document_1.createElement('a');
	  a.href = url;
	  return a.href;
	};

	var dom$1 = videojs.dom || videojs;
	var Html5 = videojs.getTech('Html5');
	QUnit.test('the environment is sane', function (assert) {
	  assert.ok(true, 'everything is swell');
	});

	function setup$1() {
	  this.oldVideojsBrowser = videojs.browser;
	  videojs.browser = videojs.mergeOptions({}, videojs.browser);
	  this.fixture = document_1.querySelector('#qunit-fixture'); // force HTML support so the tests run in a reasonable
	  // environment under phantomjs

	  this.realIsHtmlSupported = Html5.isSupported;

	  Html5.isSupported = function () {
	    return true;
	  }; // create a video element


	  var video = document_1.createElement('video');
	  this.fixture.appendChild(video); // create a video.js player

	  this.player = videojs(video); // Create two playlist container elements.

	  this.fixture.appendChild(dom$1.createEl('div', {
	    className: 'vjs-playlist'
	  }));
	  this.fixture.appendChild(dom$1.createEl('div', {
	    className: 'vjs-playlist'
	  }));
	}

	function teardown() {
	  videojs.browser = this.oldVideojsBrowser;
	  Html5.isSupported = this.realIsHtmlSupported;
	  this.player.dispose();
	  this.player = null;
	  dom$1.emptyEl(this.fixture);
	}

	QUnit.module('videojs-playlist-ui', {
	  beforeEach: setup$1,
	  afterEach: teardown
	});
	QUnit.test('registers itself', function (assert) {
	  assert.ok(this.player.playlistUi, 'registered the plugin');
	});
	QUnit.test('errors if used without the playlist plugin', function (assert) {
	  assert.throws(function () {
	    this.player.playlist = null;
	    this.player.playlistUi();
	  }, 'threw on init');
	});
	QUnit.test('is empty if the playlist plugin isn\'t initialized', function (assert) {
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.ok(this.fixture.querySelector('.vjs-playlist'), 'created the menu');
	  assert.strictEqual(items.length, 0, 'displayed no items');
	});
	QUnit.test('can be initialized with an element (deprecated form)', function (assert) {
	  var elem = dom$1.createEl('div');
	  this.player.playlist(playlist);
	  this.player.playlistUi(elem);
	  assert.strictEqual(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
	});
	QUnit.test('can be initialized with an element', function (assert) {
	  var elem = dom$1.createEl('div');
	  this.player.playlist(playlist);
	  this.player.playlistUi({
	    el: elem
	  });
	  assert.strictEqual(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
	});
	QUnit.test('can look for an element with the class "vjs-playlist" that is not already in use', function (assert) {
	  var firstEl = this.fixture.querySelectorAll('.vjs-playlist')[0];
	  var secondEl = this.fixture.querySelectorAll('.vjs-playlist')[1]; // Give the firstEl a child, so the plugin thinks it is in use and moves on
	  // to the next one.

	  firstEl.appendChild(dom$1.createEl('div'));
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  assert.strictEqual(this.player.playlistMenu.el(), secondEl, 'used the first matching/empty element');
	  assert.strictEqual(secondEl.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'found an element for each playlist item');
	});
	QUnit.test('can look for an element with a custom class that is not already in use', function (assert) {
	  var firstEl = dom$1.createEl('div', {
	    className: 'super-playlist'
	  });
	  var secondEl = dom$1.createEl('div', {
	    className: 'super-playlist'
	  }); // Give the firstEl a child, so the plugin thinks it is in use and moves on
	  // to the next one.

	  firstEl.appendChild(dom$1.createEl('div'));
	  this.fixture.appendChild(firstEl);
	  this.fixture.appendChild(secondEl);
	  this.player.playlist(playlist);
	  this.player.playlistUi({
	    className: 'super-playlist'
	  });
	  assert.strictEqual(this.player.playlistMenu.el(), secondEl, 'used the first matching/empty element');
	  assert.strictEqual(this.fixture.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
	});
	QUnit.test('specializes the class name if touch input is absent', function (assert) {
	  videojs.browser.TOUCH_ENABLED = false;
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  assert.ok(this.player.playlistMenu.hasClass('vjs-mouse'), 'marked the playlist menu');
	});
	QUnit.test('can be re-initialized without doubling the contents of the list', function (assert) {
	  var el = this.fixture.querySelectorAll('.vjs-playlist')[0];
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  this.player.playlistUi();
	  this.player.playlistUi();
	  assert.strictEqual(this.player.playlistMenu.el(), el, 'used the first matching/empty element');
	  assert.strictEqual(el.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'found an element for each playlist item');
	});
	QUnit.module('videojs-playlist-ui: Components', {
	  beforeEach: setup$1,
	  afterEach: teardown
	}); // --------------------
	// Creation and Updates
	// --------------------

	QUnit.test('includes the video name if provided', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'wrote the name');
	  assert.strictEqual(items[1].querySelector('.vjs-playlist-name').textContent, 'Untitled Video', 'wrote a placeholder for the name');
	});
	QUnit.test('includes custom data attribute if provided', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items[0].dataset.id, playlist[0].data.id, 'set a single data attribute');
	  assert.strictEqual(items[0].dataset.id, '1', 'set a single data attribute (actual value)');
	  assert.strictEqual(items[0].dataset.foo, playlist[0].data.foo, 'set an addtional data attribute');
	  assert.strictEqual(items[0].dataset.foo, 'bar', 'set an addtional data attribute');
	});
	QUnit.test('outputs a <picture> for simple thumbnails', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  var pictures = this.fixture.querySelectorAll('.vjs-playlist-item picture');
	  assert.strictEqual(pictures.length, 1, 'output one picture');
	  var imgs = pictures[0].querySelectorAll('img');
	  assert.strictEqual(imgs.length, 1, 'output one img');
	  assert.strictEqual(imgs[0].src, window_1.location.protocol + playlist[1].thumbnail, 'set the src attribute');
	});
	QUnit.test('outputs a <picture> for responsive thumbnails', function (assert) {
	  var playlistOverride = [{
	    sources: [{
	      src: '//example.com/movie.mp4',
	      type: 'video/mp4'
	    }],
	    thumbnail: [{
	      srcset: '/test/example/oceans.jpg',
	      type: 'image/jpeg',
	      media: '(min-width: 400px;)'
	    }, {
	      src: '/test/example/oceans-low.jpg'
	    }]
	  }];
	  this.player.playlist(playlistOverride);
	  this.player.playlistUi();
	  var sources = this.fixture.querySelectorAll('.vjs-playlist-item picture source');
	  var imgs = this.fixture.querySelectorAll('.vjs-playlist-item picture img');
	  assert.strictEqual(sources.length, 1, 'output one source');
	  assert.strictEqual(sources[0].srcset, playlistOverride[0].thumbnail[0].srcset, 'wrote the srcset attribute');
	  assert.strictEqual(sources[0].type, playlistOverride[0].thumbnail[0].type, 'wrote the type attribute');
	  assert.strictEqual(sources[0].media, playlistOverride[0].thumbnail[0].media, 'wrote the type attribute');
	  assert.strictEqual(imgs.length, 1, 'output one img');
	  assert.strictEqual(imgs[0].src, resolveUrl(playlistOverride[0].thumbnail[1].src), 'output the img src attribute');
	});
	QUnit.test('outputs a placeholder for items without thumbnails', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  var thumbnails = this.fixture.querySelectorAll('.vjs-playlist-item .vjs-playlist-thumbnail');
	  assert.strictEqual(thumbnails.length, playlist.length, 'output two thumbnails');
	  assert.strictEqual(thumbnails[0].nodeName.toLowerCase(), 'div', 'the second is a placeholder');
	});
	QUnit.test('includes the duration if one is provided', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  var durations = this.fixture.querySelectorAll('.vjs-playlist-item .vjs-playlist-duration');
	  assert.strictEqual(durations.length, 1, 'skipped the item without a duration');
	  assert.strictEqual(durations[0].textContent, '1:40', 'wrote the duration');
	  assert.strictEqual(durations[0].getAttribute('datetime'), 'PT0H0M' + playlist[0].duration + 'S', 'wrote a machine-readable datetime');
	});
	QUnit.test('marks the selected playlist item on startup', function (assert) {
	  this.player.playlist(playlist);

	  this.player.currentSrc = function () {
	    return playlist[0].sources[0].src;
	  };

	  this.player.playlistUi();
	  var selectedItems = this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected');
	  assert.strictEqual(selectedItems.length, 1, 'marked one playlist item');
	  assert.strictEqual(selectedItems[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'marked the first playlist item');
	});
	QUnit.test('updates the selected playlist item on loadstart', function (assert) {
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  this.player.playlist.currentItem(1);

	  this.player.currentSrc = function () {
	    return playlist[1].sources[0].src;
	  };

	  this.player.trigger('loadstart');
	  var selectedItems = this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected');
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist-item').length, playlist.length, 'displayed the correct number of items');
	  assert.strictEqual(selectedItems.length, 1, 'marked one playlist item');
	  assert.strictEqual(selectedItems[0].querySelector('img').src, resolveUrl(playlist[1].thumbnail), 'marked the second playlist item');
	});
	QUnit.test('selects no item if the playlist is not in use', function (assert) {
	  this.player.playlist(playlist);

	  this.player.playlist.currentItem = function () {
	    return -1;
	  };

	  this.player.playlistUi();
	  this.player.trigger('loadstart');
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected').length, 0, 'no items selected');
	});
	QUnit.test('updates on "playlistchange", different lengths', function (assert) {
	  this.player.playlist([]);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 0, 'no items initially');
	  this.player.playlist(playlist);
	  this.player.trigger('playlistchange');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	});
	QUnit.test('updates on "playlistchange", equal lengths', function (assert) {
	  this.player.playlist([{
	    sources: []
	  }, {
	    sources: []
	  }]);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 2, 'two items initially');
	  this.player.playlist(playlist);
	  this.player.trigger('playlistchange');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	  assert.strictEqual(this.player.playlistMenu.items[0].item, playlist[0], 'we have updated items');
	  assert.strictEqual(this.player.playlistMenu.items[1].item, playlist[1], 'we have updated items');
	});
	QUnit.test('updates on "playlistchange", update selection', function (assert) {
	  this.player.playlist(playlist);

	  this.player.currentSrc = function () {
	    return playlist[0].sources[0].src;
	  };

	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 2, 'two items initially');
	  assert.ok(/vjs-selected/.test(items[0].getAttribute('class')), 'first item is selected by default');
	  this.player.playlist.currentItem(1);

	  this.player.currentSrc = function () {
	    return playlist[1].sources[0].src;
	  };

	  this.player.trigger('playlistchange');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	  assert.ok(/vjs-selected/.test(items[1].getAttribute('class')), 'second item is selected after update');
	  assert.ok(!/vjs-selected/.test(items[0].getAttribute('class')), 'first item is not selected after update');
	});
	QUnit.test('updates on "playlistsorted", different lengths', function (assert) {
	  this.player.playlist([]);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 0, 'no items initially');
	  this.player.playlist(playlist);
	  this.player.trigger('playlistsorted');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	});
	QUnit.test('updates on "playlistsorted", equal lengths', function (assert) {
	  this.player.playlist([{
	    sources: []
	  }, {
	    sources: []
	  }]);
	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 2, 'two items initially');
	  this.player.playlist(playlist);
	  this.player.trigger('playlistsorted');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	  assert.strictEqual(this.player.playlistMenu.items[0].item, playlist[0], 'we have updated items');
	  assert.strictEqual(this.player.playlistMenu.items[1].item, playlist[1], 'we have updated items');
	});
	QUnit.test('updates on "playlistsorted", update selection', function (assert) {
	  this.player.playlist(playlist);

	  this.player.currentSrc = function () {
	    return playlist[0].sources[0].src;
	  };

	  this.player.playlistUi();
	  var items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, 2, 'two items initially');
	  assert.ok(/vjs-selected/.test(items[0].getAttribute('class')), 'first item is selected by default');
	  this.player.playlist.currentItem(1);

	  this.player.currentSrc = function () {
	    return playlist[1].sources[0].src;
	  };

	  this.player.trigger('playlistsorted');
	  items = this.fixture.querySelectorAll('.vjs-playlist-item');
	  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
	  assert.ok(/vjs-selected/.test(items[1].getAttribute('class')), 'second item is selected after update');
	  assert.ok(!/vjs-selected/.test(items[0].getAttribute('class')), 'first item is not selected after update');
	});
	QUnit.test('tracks when an ad is playing', function (assert) {
	  this.player.playlist([]);
	  this.player.playlistUi();

	  this.player.duration = function () {
	    return 5;
	  };

	  var playlistMenu = this.player.playlistMenu;
	  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
	  this.player.trigger('adstart');
	  assert.ok(playlistMenu.hasClass('vjs-ad-playing'), 'has class vjs-ad-playing');
	  this.player.trigger('adend');
	  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
	}); // -----------
	// Interaction
	// -----------

	QUnit.test('changes the selection when tapped', function (assert) {
	  var playCalled = false;
	  this.player.playlist(playlist);
	  this.player.playlistUi({
	    playOnSelect: true
	  });

	  this.player.play = function () {
	    playCalled = true;
	  };

	  var sources;

	  this.player.src = function (src) {
	    if (src) {
	      sources = src;
	    }

	    return sources[0];
	  };

	  this.player.currentSrc = function () {
	    return sources[0].src;
	  };

	  this.player.playlistMenu.items[1].trigger('tap'); // trigger a loadstart synchronously to simplify the test

	  this.player.trigger('loadstart');
	  assert.ok(this.player.playlistMenu.items[1].hasClass('vjs-selected'), 'selected the new item');
	  assert.ok(!this.player.playlistMenu.items[0].hasClass('vjs-selected'), 'deselected the old item');
	  assert.strictEqual(playCalled, true, 'play gets called if option is set');
	});
	QUnit.test('play should not get called by default upon selection of menu items ', function (assert) {
	  var playCalled = false;
	  this.player.playlist(playlist);
	  this.player.playlistUi();

	  this.player.play = function () {
	    playCalled = true;
	  };

	  var sources;

	  this.player.src = function (src) {
	    if (src) {
	      sources = src;
	    }

	    return sources[0];
	  };

	  this.player.currentSrc = function () {
	    return sources[0].src;
	  };

	  this.player.playlistMenu.items[1].trigger('tap'); // trigger a loadstart synchronously to simplify the test

	  this.player.trigger('loadstart');
	  assert.strictEqual(playCalled, false, 'play should not get called by default');
	});
	QUnit.test('disposing the playlist menu nulls out the player\'s reference to it', function (assert) {
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 2, 'there are two playlist containers at the start');
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  this.player.playlistMenu.dispose();
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 1, 'only the unused playlist container is left');
	  assert.strictEqual(this.player.playlistMenu, null, 'the playlistMenu property is null');
	});
	QUnit.test('disposing the playlist menu removes playlist menu items', function (assert) {
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 2, 'there are two playlist containers at the start');
	  this.player.playlist(playlist);
	  this.player.playlistUi(); // Cache some references so we can refer to them after disposal.

	  var items = [].concat(this.player.playlistMenu.items);
	  this.player.playlistMenu.dispose();
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 1, 'only the unused playlist container is left');
	  assert.strictEqual(this.player.playlistMenu, null, 'the playlistMenu property is null');
	  items.forEach(function (i) {
	    assert.strictEqual(i.el_, null, "the item \"" + i.id_ + "\" has been disposed");
	  });
	});
	QUnit.test('disposing the player also disposes the playlist menu', function (assert) {
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 2, 'there are two playlist containers at the start');
	  this.player.playlist(playlist);
	  this.player.playlistUi();
	  this.player.dispose();
	  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist').length, 1, 'only the unused playlist container is left');
	  assert.strictEqual(this.player.playlistMenu, null, 'the playlistMenu property is null');
	});

}(QUnit,videojs));
