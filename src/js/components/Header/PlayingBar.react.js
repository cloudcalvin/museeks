import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';

import ButtonShuffle from './ButtonShuffle.react';
import ButtonRepeat  from './ButtonRepeat.react';

import app   from '../../utils/app';
import utils from '../../utils/utils';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

export default class PlayingBar extends Component {

    constructor(props) {

        super(props);
        this.state = {
            elapsed     : 0,
            showTooltip : false,
            duration    : null,
            x           : null,
            dragging    : false
        }

        this.tick        = this.tick.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
    }

    render() {

        let queue       = this.props.queue;
        let queueCursor = this.props.queueCursor;
        let trackPlaying   = queue[queueCursor];
        let playingBar;
        let elapsedPercent;

        if(queueCursor === null) {
            playingBar = <div></div>;
        } else {

            if(this.state.elapsed < trackPlaying.duration) elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

            playingBar = (
                <div className={ this.state.dragging ? 'now-playing dragging' : 'now-playing'} onMouseMove={ this.dragOver.bind(this) } onMouseLeave={ this.dragEnd.bind(this) } onMouseUp={ this.dragEnd.bind(this) }>
                    <div className='now-playing-infos'>
                        <div className='player-options'>
                            <ButtonRepeat repeat={ this.props.repeat } />
                            <ButtonShuffle queue={ this.props.queue } shuffle={ this.props.shuffle } />
                        </div>
                        <div className='metas'>
                            <strong className='meta-title'>
                                { trackPlaying.title }
                            </strong>
                            &nbsp;by&nbsp;
                            <strong className='meta-artist'>
                                { trackPlaying.artist.join(', ') }
                            </strong>
                            &nbsp;on&nbsp;
                            <strong className='meta-album'>
                                { trackPlaying.album }
                            </strong>
                        </div>

                        <span className='duration'>
                            { utils.parseDuration(this.state.elapsed) } / { utils.parseDuration(trackPlaying.duration) }
                        </span>
                    </div>
                    <div className='now-playing-bar'>
                        <div className={ this.state.duration !== null ? 'playing-bar-tooltip' : 'playing-bar-tooltip hidden'} style={{ left: this.state.x - 12 }}>{ utils.parseDuration(this.state.duration) }</div>
                        <ProgressBar
                            now={ elapsedPercent }
                            onMouseDown={ this.jumpAudioTo.bind(this) }
                            onMouseMove={ this.showTooltip.bind(this) }
                            onMouseLeave={ this.hideTooltip.bind(this) }
                        />
                    </div>
                </div>
            );
        }

        return playingBar;
    }

    componentDidMount() {
        this.timer = setInterval(this.tick, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    tick() {
        this.setState({ elapsed: app.audio.currentTime });
    }

    jumpAudioTo(e) {

        this.setState({ dragging : true });

        let queue       = this.props.queue;
        let queueCursor = this.props.queueCursor;
        let trackPlaying   = queue[queueCursor];

        let bar = document.querySelector('.now-playing-bar');
        let percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        let jumpTo = (percent * trackPlaying.duration) / 100;

        AppActions.player.jumpTo(jumpTo);
    }

    dragOver(e) {
        // Chack if it's needed to update currentTime
        if(this.state.dragging) {

            let queue       = this.props.queue;
            let queueCursor = this.props.queueCursor;
            let trackPlaying   = queue[queueCursor];

            let bar = document.querySelector('.now-playing-bar');
            let percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

            let jumpTo = (percent * trackPlaying.duration) / 100;

            AppActions.player.jumpTo(jumpTo);
        }
    }

    dragEnd() {
        if(this.state.dragging) {
            this.setState({ dragging : false });
        }
    }

    showTooltip(e) {

        let queue       = this.props.queue;
        let queueCursor = this.props.queueCursor;
        let trackPlaying   = queue[queueCursor];

        let bar = document.querySelector('.now-playing-bar');
        let percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        let time = (percent * trackPlaying.duration) / 100;

        this.setState({
            duration : time,
            x        : e.pageX
        });
    }

    hideTooltip() {
        this.setState({
            duration : null,
            x        : null
        });
    }
}
