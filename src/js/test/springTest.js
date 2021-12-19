import { useSpring } from '../animation/spring/useSpring.js';

export function springTest() {
    const btnStart = document.querySelector('.spring-btn-start');
    const btnBack = document.querySelector('.spring-btn-back');
    const btnStop = document.querySelector('.spring-btn-stop');
    const btnPause = document.querySelector('.spring-btn-pause');
    const btnPlay = document.querySelector('.spring-btn-play');
    const target = document.querySelector('.spring-target');

    const mySpring = new useSpring();
    mySpring.setData({ x: 0, y: 0, rotate: 0 });
    mySpring.subscribe(({ x, y, rotate }) => {
        target.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    });

    function tweenback() {
        mySpring.updatePreset('gentle');
        return mySpring.goTo({ x: 0, y: 0, rotate: 180 });
    }

    function intialTween() {
        mySpring.stop();
        mySpring.updatePreset('wobbly');
        return mySpring.set({ x: 0, y: 0, rotate: 0 });
    }

    function tween1() {
        return mySpring.goTo({ x: 400 });
    }

    function tween2() {
        mySpring.updatePreset('default');
        return mySpring.goTo({ y: 400 });
    }

    function tween3() {
        mySpring.updatePreset('bounce');
        return mySpring.goTo({ x: -100, rotate: 90 });
    }

    function tween4() {
        mySpring.updatePreset('gentle');
        return mySpring.goTo({ x: 0, y: 0, rotate: 0 });
    }

    btnStart.addEventListener('click', () => {
        intialTween()
            .then(() => tween1())
            .then(() => tween2())
            .then(() => tween3())
            .then(() => tween4())
            .catch(() => {});
    });

    btnBack.addEventListener('click', () => {
        tweenback().catch(() => {});
    });

    btnStop.addEventListener('click', () => {
        mySpring.stop();
    });

    btnPause.addEventListener('click', () => {
        mySpring.pause();
    });

    btnPlay.addEventListener('click', () => {
        mySpring.resume();
    });
}
