// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerificationBadge } from "@/components/status-badge";

describe("VerificationBadge", () => {
  it("renders uncertain status without implying verification", () => {
    render(<VerificationBadge status="uncertain" confidence="low" />);
    expect(screen.getByText("Uncertain")).toBeTruthy();
  });
});
