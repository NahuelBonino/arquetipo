import { render } from '@/tests/testUtils';
import Loader from "@/components/Loader/loader";
import "@testing-library/jest-dom";

describe("Loader", () => {
  it("render Loader component", () => {
    const component = render(<Loader />);
    component.getAllByTestId("loader-wrapper-test"); //getAllByText, Role, Title is better than this
  });
});
