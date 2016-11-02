'use strict';
import React, {Component} from 'react';
import {
  AppRegistry,
  Image,
  Dimensions,
  Platform,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from 'react-native-slider';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';

let SOFT_MENU_HEIGHT;
if(Platform.OS === 'ios'){
  SOFT_MENU_HEIGHT=0
} else {
  SOFT_MENU_HEIGHT=23
}


const window = Dimensions.get('window');
const FRAME_RATE = 500;

class Player extends Component {
  constructor(props){
    super(props);
    this.state = {
      play: props.play,
      shuffle: false,
      sliding: false,
      currentTime: 0,
      songIndex: props.songIndex,
      rooqyas: props.rooqyas,
      currentIndex: props.currentIndex,
      songs: props.songs,
      songPercentage: 0,
      looping: false
    };
  }
  componentDidMount() {
      this.interval = setInterval(function() {
        if( this.state.rooqyas[this.state.currentIndex].getDuration() !== undefined ){
          this.state.rooqyas[this.state.currentIndex].getCurrentTime( (seconds) => {
            this.setState({ currentTime: seconds, songPercentage: seconds / this.state.rooqyas[this.state.currentIndex].getDuration()   })
          });
        }
      }.bind(this), FRAME_RATE);
      this.setState({ currentIndex: this.state.songIndex, play: true, songIndex: this.state.songIndex });
  }
  
  componentWillUnmount() {
    this.toggleLoop(true);
    clearInterval(this.interval);
  }

  togglePlay() {
    if(this.state.play){
      this.state.rooqyas[this.state.currentIndex].pause();
    } else {
      this.state.rooqyas[this.state.currentIndex].play();
    }
    this.setState({ play: !this.state.play });
  }

  toggleShuffle(){
    this.setState({ shuffle: !this.state.shuffle });
  }
  
  toggleLoop(stopLooping) {

    if(stopLooping) {
      this.state.rooqyas[this.state.currentIndex].setNumberOfLoops(0);
      return;
    }

    if(this.state.rooqyas[this.state.currentIndex].getNumberOfLoops() == 0) {
      this.state.rooqyas[this.state.currentIndex].setNumberOfLoops(-1);
      this.setState({ looping: true});
    } else {
      this.state.rooqyas[this.state.currentIndex].setNumberOfLoops(0);
      this.setState({ looping: false});
    }
  }
  
  goBackward(){
    if(this.state.rooqyas[this.state.currentIndex-1] == undefined) {
      alert("The roqya is not downloaded!");
      return
    }

    if(this.state.currentIndex > 0 ){
      this.state.rooqyas[this.state.currentIndex].stop();
      this.state.rooqyas[this.state.currentIndex-1].play();
      this.setState({currentIndex: this.state.currentIndex - 1, play: true});
    } 
  }

  goForward(){
    var index = this.state.shuffle ? this.randomSongIndex() : this.state.currentIndex + 1;
    
    if(this.state.rooqyas[index] == undefined) {
      alert("The roqya is not downloaded!");
      return;
    }
    this.state.rooqyas[this.state.currentIndex].stop();
    this.state.rooqyas[index].play();

    this.setState({
      currentIndex: index,
      currentTime: 0,
      play: true 
    });
  }

  randomSongIndex(){
    let maxIndex = this.props.rooqyas.length - 1;
    return Math.floor(Math.random() * (maxIndex - 0 + 1)) + 0;
  }
  onSlidingChange(value){
    let newPosition = value * this.state.rooqyas[this.state.currentIndex].getDuration();
    this.state.rooqyas[this.state.currentIndex].setCurrentTime(newPosition);
    this.setState({ currentTime: newPosition });
  }

  // onEnd(){
  //   this.setState({ play: false });
  //   if(this.state.loop) {
  //     this.loopRooqyah();
  //     this.setState({ play: true });
  //     return;
  //   }
  //   if(this.state.shuffle) {
  //     this.goForward();
  //   }
  // }
  
  render() {
    let songPlaying = this.props.songs[this.state.currentIndex];

    let playButton;
    if( this.state.play ){
      playButton = <TouchableHighlight 
                      onPress={this.togglePlay.bind(this)}
                      underlayColor="rgba(255, 255, 255, 0)">
                      <Image source={require('./../../assets/Pause.png')} onPress={ this.togglePlay.bind(this) } style={ styles.play } />
                  </TouchableHighlight>;
    } else {
      playButton = <TouchableHighlight 
                     onPress={ this.togglePlay.bind(this) } 
                     underlayColor="rgba(255, 255, 255, 0)">
                     <Image source={require('./../../assets/PlayerPlayButton.png')} style={ styles.play } />
                    </TouchableHighlight>;
    }

    let forwardButton;
    if( !this.state.shuffle && this.state.current + 1 === this.props.rooqyas.length ){
      forwardButton = <TouchableHighlight 
                       underlayColor="rgba(255, 255, 255, 0)">
                      <Image source={require('./../../assets/forward.png')}  style={styles.forward}/>;
                    </TouchableHighlight>
    } else {
      forwardButton =
                    <TouchableHighlight 
                       onPress={ this.goForward.bind(this) } 
                       underlayColor="rgba(255, 255, 255, 0)">
                      <Image source={require('./../../assets/forward.png')} style={ styles.forward }/>
                    </TouchableHighlight>;
    }
    

    let hamburgerButton = <TouchableHighlight 
                      onPress={ () => Actions.pop({refresh: { currentIndex: this.state.currentIndex, songIndex: this.state.currentIndex, backPressed: true}} )  } 
                      underlayColor="rgba(255, 255, 255, 0)"
                      style={styles.hamburgerButton}>
                        <Image source={require('./../../assets/Hamburger.png')} style={ styles.hamburgerImage }/>
                    </TouchableHighlight>;

    let shuffleButton;
    if( this.state.shuffle ){
      shuffleButton = 
                    <TouchableHighlight 
                      onPress={this.toggleShuffle.bind(this)} 
                      underlayColor="rgba(255, 255, 255, 0)"
                      style={styles.shuffleButtonActive}>
                        <Image source={require('./../../assets/Shuffle.png')} style={styles.shuffleImage}/>
                    </TouchableHighlight>;
    } else {
      shuffleButton = 
                      <TouchableHighlight 
                        onPress={this.toggleShuffle.bind(this)} 
                        underlayColor="rgba(255, 255, 255, 0)"
                        style={styles.shuffleButton}>
                          <Image source={require('./../../assets/Shuffle.png')} style={styles.shuffleImage}/>
                      </TouchableHighlight>;
    }
    
    
    let loopButton;
    if(this.state.looping){
      loopButton = 
                    <TouchableHighlight 
                      onPress={ () => { this.toggleLoop(false) } } 
                      underlayColor="rgba(255, 255, 255, 0)"
                      style={styles.loopButtonActive}>
                        <Image source={require('./../../assets/Loop.png')} style={styles.loopImage}/>
                    </TouchableHighlight>;
    } else {
      loopButton = 
                      <TouchableHighlight 
                        onPress={ () => { this.toggleLoop(false) } } 
                        underlayColor="rgba(255, 255, 255, 0)"
                        style={styles.loopButton}>
                          <Image source={require('./../../assets/Loop.png')} style={ styles.loopImage } />
                      </TouchableHighlight>;
    }
    
    

    return (
      <View style={styles.container}>
        <LinearGradient colors={['#22BBC9', '#00AE91']} locations={[0, 1.0]}  style={{ height: window.height-SOFT_MENU_HEIGHT, width: window.width }}>
        <View style={{flex: 1,justifyContent: 'flex-end',flexDirection: 'column'}}>
          <View style={ styles.header }>
            <Text style={ styles.headerText }>
              { this.props.artist.name } 
            </Text>
          </View>
          <View style={ styles.headerClose }>
            <View style={{flex: 3, paddingLeft: 20}}> 
              <Icon
                  onPress={ () => Actions.pop({refresh: { currentIndex: this.state.currentIndex, songIndex: this.state.currentIndex, backPressed: true}} )  } 
                  name="ios-arrow-back" size={25} color="#fff" />
            </View>
            <View
              style={{
                flex: 21,
                justifyContent:  'center',
                paddingRight: 35,
                flexDirection: 'row'
              }}>
              <Text
                style={{
                  color: "rgba(255,255,255,1)",
                  fontSize: 16,
                  alignSelf: 'center',
                  fontWeight: 'normal',
                  fontFamily: 'Open Sans',
                }}>
                Player
              </Text>
            </View>    
          </View>

          <Text style={ styles.songTitle }>
            { songPlaying.title }
          </Text>
          <Text style={ styles.albumTitle }>
            { songPlaying.album }
          </Text>
        </View> 

        <View style={{flex: 1,justifyContent: 'flex-end', flexDirection: 'column'}}>

          <View style={ styles.controls }>
            <TouchableHighlight 
              onPress={ this.goBackward.bind(this) } 
              underlayColor="rgba(255, 255, 255, 0)">
                <Image source={require('./../../assets/backward.png')} style={ styles.back }/>
            </TouchableHighlight>
            { playButton }
            { forwardButton }
          </View>

          <View style={ styles.sliderContainer }>
            <View style={ styles.timeInfo }>
              <Text style={ styles.time }> { formattedTime(this.state.currentTime) } </Text>
              <Text style={ styles.timeRight }>{ formattedTime( this.state.rooqyas[this.state.currentIndex].getDuration() )  }</Text>
            </View>
            <Slider
              onSlidingStart={ () => {} }
              onValueChange={ this.onSlidingChange.bind(this) }
              minimumTrackTintColor="white"
              maximumTrackTintColor="rgba(255,255,255,0.5)"
              style={ styles.slider }
              trackStyle={ styles.sliderTrack }
              thumbStyle={ styles.sliderThumb }
              value={ this.state.songPercentage }/>
          </View>

          <View style={styles.controlsHelpers}>
            { shuffleButton }
            { loopButton }
            { hamburgerButton }
          </View>
        </View>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0)',
    marginTop: 17,
    marginBottom: 17,
    width: window.width,
  },
  headerClose: {
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    flexDirection: 'row',
    width: window.width,
    top: 20,
    left: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 20,
  },
  headerText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  songTitle: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: "white",
    fontFamily: "Open Sans",
    marginBottom: 10,
    marginTop: 13,
    fontSize: 35,
    paddingLeft: 30
  },
  albumTitle: {
    color: "#fff",
    opacity: 0.8,
    fontFamily: "Open Sans",
    fontSize: 14,
    marginBottom: 40,
    paddingLeft: 30,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  controls: {
    flexDirection: 'row',
    width: window.width,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  back: {
    marginTop: 22,
    marginLeft: 45,
    width: 34,
    height: 25
  },
  play: {
    marginLeft: 35,
    marginRight: 35,
    width: 75, 
    height:75
  },
  forward: {
    marginTop: 22,
    marginRight: 40,
    width: 34,
    height: 25
  },
  shuffleButton: {
    alignSelf: 'center',
    width: 30,
    height: 30 / 1.25,
    opacity: 0.4
  },
  shuffleButtonActive: {
    alignSelf: 'center',
    width: 30,
    height: 30 / 1.25
  },
  
  loopButton: {
    alignSelf: 'center',
    opacity: 0.4
  },
  loopButtonActive: {
    alignSelf: 'center',
  },
  volume: {
    alignSelf: 'center'
  },
  timeInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  time: {
    color: '#FFF',
    flex: 1,
    marginLeft: 5,
    fontSize: 10,
  },
  timeRight: {
    color: '#FFF',
    textAlign: 'right',
    flex: 1,
    marginRight: 5,
    fontSize: 10,
  },
  sliderContainer: {
    width: window.width
  },
  slider: {
    height: 5
  },
  sliderTrack: {
    height: 5,
  },
  sliderThumb: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 12 / 2
  },

  controlsHelpers: {
    width: window.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center',  
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  shuffleImage: {
    width: 30,
    height: 30 / 1.25
  },
  loopImage: {
    width: 30,
    height: 30 / 1.06
  },
  hamburgerButton: {
    alignSelf: 'center'
  },
  hamburgerImage: {
    width: 30,
    height: 30 / 1.3
  }
});

//TODO: Move this to a Utils file
function withLeadingZero(amount){
  if (amount < 10 ){
    return `0${ amount }`;
  } else {
    return `${ amount }`;
  }
}

function formattedTime( timeInSeconds ){
  let minutes = Math.floor(timeInSeconds / 60);
  let seconds = timeInSeconds - minutes * 60;

  if( isNaN(minutes) || isNaN(seconds) ){
    return "";
  } else {
    return(`${ withLeadingZero( minutes ) }:${ withLeadingZero( seconds.toFixed(0) ) }`);
  }
}


module.exports = Player;
