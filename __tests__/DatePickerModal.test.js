import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {DatePickerModal} from '../src/components/common/DatePickerModal';
import {AddAdvanceSheet} from '../src/features/trips/sheets/AddAdvanceSheet';
import {AddDriverBalanceSheet} from '../src/features/trips/sheets/AddDriverBalanceSheet';

describe('DatePickerModal Component & Calendar Integration', () => {
  it('renders DatePickerModal when visible', () => {
    const onClose = jest.fn();
    const onSelectDate = jest.fn();
    let tree;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <DatePickerModal
          visible={true}
          initialDate="25 Aug 2026"
          title="Select Advance Date"
          onSelectDate={onSelectDate}
          onClose={onClose}
        />,
      );
    });

    expect(tree).toBeDefined();
    const textNodes = tree.root.findAllByType('Text');
    const hasTitle = textNodes.some(node => node.props.children === 'Select Advance Date');
    expect(hasTitle).toBe(true);
  });

  it('renders correctly with default title and today date if initialDate is empty', () => {
    const onClose = jest.fn();
    const onSelectDate = jest.fn();
    let tree;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <DatePickerModal
          visible={true}
          onSelectDate={onSelectDate}
          onClose={onClose}
        />,
      );
    });

    expect(tree).toBeDefined();
    const textNodes = tree.root.findAllByType('Text');
    const hasDefaultTitle = textNodes.some(node => node.props.children === 'Select Date');
    expect(hasDefaultTitle).toBe(true);
  });

  it('renders AddAdvanceSheet with calendar picker integration', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    let tree;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AddAdvanceSheet visible={true} onSave={onSave} onClose={onClose} />,
      );
    });

    expect(tree).toBeDefined();
    const datePickerModals = tree.root.findAllByType(DatePickerModal);
    expect(datePickerModals.length).toBe(1);
    expect(datePickerModals[0].props.title).toBe('Select Advance Date');
  });

  it('renders AddDriverBalanceSheet with calendar picker integration', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    let tree;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AddDriverBalanceSheet
          visible={true}
          driverName="Ramesh Kumar"
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      );
    });

    expect(tree).toBeDefined();
    const datePickerModals = tree.root.findAllByType(DatePickerModal);
    expect(datePickerModals.length).toBe(1);
    expect(datePickerModals[0].props.title).toBe('Select Date');
  });
});
