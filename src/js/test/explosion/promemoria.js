let masterSequencer = new HandleMasterSequencer();

const staggerArray = masterSequencer.createStegger(item, { stagger: {} });

staggerArray.forEach(({ start, end, item }, i) => {
    const sequencer = new HandleSequencer();
    // ....

    sequencer
        .setData({ y: 0 })
        .goTo({ y: 300 }, { start, end, ease: 'easeInOutBack' });

    // ...

    masterSequencer.add(sequencer);
});
