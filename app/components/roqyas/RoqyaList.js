'use strict';
import React,{Component} from 'react';

import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Image,
  TouchableHighlight,
  Platform,
  Text,
  View,
  StatusBar,
  ListView
} from 'react-native';

import Sound from 'react-native-sound'

import MusicControl from 'react-native-music-control';

import * as Progress from 'react-native-progress';

import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

let SOFT_MENU_HEIGHT;
if(Platform.OS === 'ios'){
  SOFT_MENU_HEIGHT=0
} else {
  SOFT_MENU_HEIGHT=23
}

const window = Dimensions.get('window');
const intervalTime = 1000;

import { Author } from '../../data';

class RoqyaList extends Component {

    constructor(props) {
        super(props);
        var downloadedSongs  = [];
        for(var i=0; i < Author[0].songs.length; i++) {
            downloadedSongs.push({isDownloaded: false});
        }
        this.state = {
            play: false,
            currentIndex: 0,
            rooqyas: [],
            songs: [],
            downloadedSongs: downloadedSongs,
            downloading: 0,
            downloading_id: -1
        }
    }

    componentDidMount() {
      if(Platform.OS === 'ios'){
            MusicControl.enableBackgroundMode(true);
            MusicControl.enableControl('nextTrack', true)
            MusicControl.enableControl('previousTrack', true)
            MusicControl.enableControl('pause', true)
            MusicControl.enableControl('play', true)
            MusicControl.enableControl('togglePlayPause', true)
            MusicControl.enableControl('disableLanguageOption', true)
            MusicControl.enableControl('togglePlayPause', true)
            MusicControl.enableControl('togglePlayPause', true)
            MusicControl.enableControl('togglePlayPause', true)

            MusicControl.on('play', function() {
                this.playRemoteControl()
            }.bind(this))

            MusicControl.on('pause', function() {
                this.pauseRemoteControl()
            }.bind(this))

            MusicControl.on('nextTrack', function() {
                this.nextRemoteControl()
            }.bind(this))

            MusicControl.on('previousTrack', function() {
                this.previousRemoteControl()
            }.bind(this))
        }
    }

    playRemoteControl() {
        if(this.state.rooqyas[this.state.currentIndex] == undefined ) return;
        this.state.rooqyas[this.state.currentIndex].play();
        this.musicPlayer(Author[0].songs[this.state.currentIndex].title)
        this.setState({
            play: true
        })
    }

    pauseRemoteControl() {
        if(this.state.rooqyas[this.state.currentIndex] == undefined ) return;
        this.state.rooqyas[this.state.currentIndex].pause();
        this.musicPlayer(Author[0].songs[this.state.currentIndex].title)
        this.setState({
            play: false
        })
    }

    nextRemoteControl() {
        if(this.state.rooqyas[this.state.currentIndex+1] == undefined ) return;
        this.state.rooqyas[this.state.currentIndex].stop();
        this.state.rooqyas[this.state.currentIndex+1].play()
        this.musicPlayer(Author[0].songs[this.state.currentIndex+1].title)
        this.setState({
            currentIndex: this.state.currentIndex+1,
            play: true
        })
    }

    previousRemoteControl() {
        if(this.state.rooqyas[this.state.currentIndex-1] == undefined ) return;
        this.state.rooqyas[this.state.currentIndex].stop();
        this.state.rooqyas[this.state.currentIndex-1].play()
        this.musicPlayer(Author[0].songs[this.state.currentIndex-1].title)
        this.setState({
            currentIndex: this.state.currentIndex-1,
            play: true
        })
    }

    _downloadFile(rowId, background) {
        if(this.state.downloading != 0 ) {
            alert("Wait for download to finish!");
            return;
        } 
        if(!rowId) {
            return;
        }        
        let options = {
            fromUrl: Author[0].songs[rowId].url,          // URL to download file from
            toFile: RNFS.DocumentDirectoryPath + '/song_'+ rowId + '.mp3'           // Local filesystem path to save the file to
        };

        var progress = data => {
            var percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
            this.setState({
                downloading: percentage / 100, 
                downloading_id: rowId
            })
        };

        var begin = res => {};

        // // Random file name needed to force refresh...
        // const downloadDest = `${RNFS.DocumentDirectoryPath}/${((Math.random() * 1000) | 0)}.jpg`;

        const ret = RNFS.downloadFile({ fromUrl: options.fromUrl, toFile: options.toFile,progressDivider: 1, background: background, begin: begin, progress: progress});

        ret.promise.then( function(result) {
            if(result.statusCode >= 200) {
                this.loadSongWithIndex(rowId)
                this.state.downloadedSongs[rowId].isDownloaded = true
                this.setState({
                    downloading: 0,
                    downloading_id: -1,
                    downloadedSongs: this.state.downloadedSongs
                })
            }
        }.bind(this));
    }

      loadSound(i) {
        var sound = new Sound('song_'+i+'.mp3', RNFS.DocumentDirectoryPath, (errors) => {
            this.state.rooqyas[i] = sound;
            this.state.songs[i] = Author[0].songs[i]
            this.setState({ 
              rooqyas: this.state.rooqyas, 
              songs: this.state.songs 
            })
            if(Platform.OS === 'ios'){
              Sound.enableInSilenceMode(true);
            }
        })
      }

    loadSongWithIndex(index) {
        var sound = new Sound('song_'+index+'.mp3', RNFS.DocumentDirectoryPath, (errors) => {
            if(sound.getDuration() < 0) {
              RNFS.unlink(RNFS.DocumentDirectoryPath+"/song_"+index+'.mp3').then(() => { this.setState({ reload: true})})
              .catch((err) => { alert("Error Loading File!") });
              return false;
            }
            if(Platform.OS === 'ios'){
                Sound.enableInSilenceMode(true);
            }
            this.state.rooqyas[index] = sound;
            this.state.songs[index] = Author[0].songs[index]
            this.setState({ 
                rooqyas: this.state.rooqyas, 
                songs: this.state.songs
            })
            return true;
        })
    }

    componentWillMount() {
        for(let i=0; i < Author[0].songs.length; i++) {
            this.checkDurationOrDownload(i);
        }
    }
  
  onItemChange(roqya) {
    
    if(! this.state.downloadedSongs[roqya].isDownloaded) {
        alert("You should download the roqya first!")
        return false;
    }
    
    if(roqya != this.state.currentIndex){
      this.state.rooqyas[this.state.currentIndex].stop();
      this.state.rooqyas[roqya].play( (errors) => {
        clearInterval(this.interval);
        this.setState({ play: false});
      });
      
      if(Platform.OS === 'ios'){
        this.musicPlayer(Author[0].songs[roqya].title)
      }
      this.setState({ play: true, currentIndex: roqya });

      this.interval = setInterval( () => {
        this.state.rooqyas[this.state.currentIndex].getCurrentTime( (seconds) => {
          this.setState({ interval: seconds});
        })
      }, intervalTime ) 
      return;
    } 
    
    if( this.state.currentIndex == roqya ) {
      if(this.state.play) {
        this.setState({play: false});
        this.state.rooqyas[roqya].pause();
        clearInterval(this.interval);
      } else {
        this.interval = setInterval( () => {
          this.state.rooqyas[this.state.currentIndex].getCurrentTime( (seconds) => {
            this.setState({ interval: seconds});
          })
        }, intervalTime ) 
        this.setState({play: true});
        this.state.rooqyas[roqya].play();
      }
      return;
    }
    
    this.state.rooqyas[this.state.currentIndex].stop();
    
    this.state.rooqyas[roqya].play();

    this.interval = setInterval( () => {
      this.state.rooqyas[this.state.currentIndex].getCurrentTime( (seconds) => {
        this.setState({ interval: seconds});
      })
    }, intervalTime ) 
    
    this.setState({ play: true});
  }

  renderStickyHeader() {
    return(
      <View style={ styles.stickySection }>
        <Text style={ styles.stickySectionTitle }>{Author[0].name}</Text>
      </View>
    );
  }

  goToPlayer(songId) {

    if(! this.state.downloadedSongs[songId].isDownloaded) {
        alert("You should download the roqya first");
        return false
    }

    if(songId != this.state.currentIndex) {
      this.state.rooqyas[this.state.currentIndex].stop();
    }

    this.state.rooqyas[songId].play();
    clearInterval(this.interval);

    if(Platform.OS === 'ios'){
      this.musicPlayer(Author[0].songs[songId].title)
    }
    this.setState({ currentIndex: songId, play:true, backPressed: undefined });    

    Actions.player({ 
      songIndex: songId,
      songs: Author[0].songs, 
      artist: Author[0].name,
      play: this.state.play,
      rooqyas: this.state.rooqyas,
      currentIndex: this.state.currentIndex
    })  
  }

  randomSongIndex(){
    var downloaded = [];
    for(var i=0; i < this.state.downloadedSongs.length; i++) {
        if(this.state.downloadedSongs[i].isDownloaded) {
          downloaded.push(i);
        }
    }
    return  downloaded[Math.floor(Math.random()*downloaded.length)];
  }

  calculateBorder(rowID)
  {
    if(Platform.OS==="ios") {
      return parseInt(rowID) == this.state.currentIndex  && this.state.play ? 0 : 0.3
    } else {
      return 0;
    }
  }

  renderSongsList() {
    let songsDataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows( Author[0].songs );
    return(
      <ListView
        dataSource={ songsDataSource }
        style={styles.rooqyahList}
        renderRow={(song, sectionId, rowId) => (
            <TouchableHighlight 
                onPress={ () => this.goToPlayer(parseInt(rowId)) } 
                style={{ backgroundColor: parseInt(rowId) == this.state.currentIndex  && this.state.play ? "rgba(255, 255, 255, 0.25)":"rgba(255, 255, 255, 0)"}}
                activeOpacity={ 25 } 
                underlayColor="rgba(255, 255, 255, 0.25)"
            >
                <View style={ styles.rowStyle }> 
                    <View style={styles.iconView}>
                        <TouchableHighlight    
                          onPress={ () => this.onItemChange(parseInt(rowId)) }
                          activeOpacity={ 25 } 
                          underlayColor="rgba(255, 255, 255, 0.25)"
                        >
                            {this.renderPlayIcon(rowId)}
                        </TouchableHighlight>
                    </View>
                    <View style={{ flexDirection: 'row',flex: 14,borderBottomWidth: this.calculateBorder(rowId),borderBottomColor: "#fff"}}>
                    <View key={song} style={styles.rowTextView}>
                        <Text style={ styles.rooqyahTitle }>
                            {parseInt(rowId) + 1 } - { formatTitle(song.title) }
                        </Text>
                    </View>
                    <View style={styles.durationView}>
                        {(()=> {
                            if(this.state.currentIndex == parseInt(rowId) && this.state.play) 
                            {
                                return ( <Text style={styles.rooqyahDuration}>
                                  { formattedTime( this.state.interval ? this.state.interval : 0 ) }
                                </Text>);
                            } 
                            else {
                                
                                return this.renderDurationOrDownload(rowId)
                            }
                          }
                         ) ()}
                    </View>
              </View>
            </View>
          </TouchableHighlight>
          )}/>
    );
  }

    renderDownloadingProgress() {
        return <Progress.Circle size={25} hidesWhenStopped={true} thickness={2} borderWidth={2} color={'rgba(255, 255, 255, 1)'} progress={this.state.downloading}/>
    }

    renderDownloadButton(rowId) {
        return <Icon name="ios-cloud-download-outline" md="md-cloud-download" style={{ fontSize: 25, color: 'white'}}
            onPress={this._downloadFile.bind(this, rowId, true)}></Icon>
    }

    renderDurationText(rowId) {
        return <Text style={styles.rooqyahDuration}> 
            {formattedTime( Author[0].songs[rowId].length? Author[0].songs[rowId].length : 0  ) }
        </Text>
    }

    renderDurationOrDownload(rowId) {
        if(this.state.downloading > 0 && this.state.downloading_id == rowId) {
            return this.renderDownloadingProgress(rowId);
        }
        if( this.state.downloadedSongs[rowId].isDownloaded)
            return this.renderDurationText(rowId)
        else
            return this.renderDownloadButton(rowId)
    }

    checkDurationOrDownload(rowId) {
        return Promise.resolve(RNFS.exists(RNFS.DocumentDirectoryPath + '/song_' + rowId + '.mp3') )
            .then(function(obj){ return obj;} )
            .done(function(obj) {
                this.state.downloadedSongs[rowId].isDownloaded = obj
                if(obj) {
                    this.loadSongWithIndex(rowId)
                }
                this.setState({
                    downloadedSongs: this.state.downloadedSongs
                })
            }.bind(this))
    }

  renderPlayIcon(rowId) {
    if(Platform.OS === 'ios'){
      if(parseInt(rowId) == this.state.currentIndex  && this.state.play) {
        return <Image source={require('../../assets/pause-small.png')} style={styles.playIcon} />
      } else {
        return <Image source={require('../../assets/playbutton.png')} style={styles.playIcon} />
      }
    }

    if(parseInt(rowId) == this.state.currentIndex  && this.state.play) {
      return <Image source={require('../../assets/android-pause.png')} style={styles.playIconAndroid} />
    } else {
      return <Image source={require('../../assets/android-play.png')} style={styles.playIconAndroid} />
    }
  }

    musicPlayer(title) {
        MusicControl.setNowPlaying({
            title: title,
            artwork: 'http://a3.mzstatic.com/us/r30/Purple71/v4/28/68/fa/2868fa46-6291-4520-bb28-aad6942f7c3e/screen696x696.jpeg',
        })
    }

  render() {
    let songPlaying = Author[0].songs[this.state.currentIndex];

    if(this.props.backPressed && this.state.backPressed == undefined) {
      this.interval = setInterval( () => {
        this.state.rooqyas[this.state.currentIndex].getCurrentTime( (seconds) => {
          this.setState({ interval: seconds, backPressed: 'defined'});
        })
      }, intervalTime ) 
    }
    // const { onScroll = () => {} } = this.props;
    return (
        <LinearGradient colors={['#22BBC9', '#00AE91']} locations={[0, 1.0]}  style={{ flex: 1, height: window.height-SOFT_MENU_HEIGHT }}>
          <StatusBar barStyle="light-content" backgroundColor="#147077" />
          <Text style={styles.appTitle}></Text>
          { this.renderSongsList() }
          <TouchableHighlight
            onPress={ () => {this.goToPlayer(this.randomSongIndex())} }>
            <View style={styles.randomButtonView}>
                <Image source={require('./../../assets/play.png')} style={styles.playRandomButton}/>
                <Text style={styles.randomButtonText}> Play Random </Text>
              </View>
          </TouchableHighlight>
        </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  appTitle: {
    alignSelf:'center',
    marginTop:30,
    color: "white",
    fontFamily: "Open Sans",
    fontSize: 21

  },
  rooqyahList:{
    marginTop: 30,
  },
  linearGradient: {

  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 70,
    marginLeft: 20,
    marginRight: 20
  },
  
  rooqyahTitle: {
    color: "white",
    fontFamily: "Open Sans",
    fontSize: 21
  },
  rooqyahDuration: {
    color: "white",
    fontFamily: "Open Sans",
    fontSize: 14
  },
  rowTextView: {
    alignSelf: 'center',
    flex: 10,
    justifyContent: 'center'
  },
  durationView: {
    alignSelf: 'center',
    flex: 2,
    justifyContent: 'flex-end'
  },
  iconView: {
    flex: 2,
    justifyContent: 'center',
  },
  playIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  playIconAndroid: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  playRandomButton: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  
  randomButtonView: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: "rgba(255,255,255,0.25)",
    width: window.width,
    alignItems: 'center',
    justifyContent:'center'
  },
  
  randomButtonText: {
    color: "white",
    fontFamily: "Open Sans",
    marginLeft: 10
  }

});


function withLeadingZero(amount){
  if (amount < 10 ){
    return `0${ amount }`;
  } else {
    return `${ amount }`;
  }
}
function formattedTime( timeInSeconds ){
  let hours = Math.floor(timeInSeconds / 3600);
  let minutes = Math.floor( (timeInSeconds-hours * 3600) / 60);
  let seconds = timeInSeconds - minutes * 60 - hours * 3600;

  if( isNaN(minutes) || isNaN(seconds) ){
    return "";
  } else {
    if(hours) {
      return(`${(hours)}:${ withLeadingZero( minutes ) }:${ withLeadingZero( seconds.toFixed(0) ) }`);  
    }
    return(`${ withLeadingZero( minutes ) }:${ withLeadingZero( seconds.toFixed(0) ) }`);
  }
}
function formatTitle(title) {
  if(title.length > 25) {
    return title.substr(0, 16) + "...";
  } else {
    return title;
  }
}


module.exports = RoqyaList;