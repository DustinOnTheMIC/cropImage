import React from 'react';
import { shallow } from 'enzyme';
import CropImage from './cropImage';

describe('<CropImage />', () => {
  test('renders', () => {
    const wrapper = shallow(<CropImage />);
    expect(wrapper).toMatchSnapshot();
  });
});
